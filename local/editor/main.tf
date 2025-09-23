# Terraform Provider and Backend setup for storing state.
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    key = "local/editor/terraform.tfstate"
    encrypt = true
  }
}

variable "region" {}
# Configure the AWS Provider
provider "aws" {
  region = var.region
}

variable "cms_publish_bucket" {
  description = "CMS Publish Bucket Name"
}
variable "workflow_bucket" {
  description = "Workflow Bucket Name"
}




# Use a Random ID Generator to keep some things unique.
resource "random_id" "server" {
  keepers = {
    # Generate a new id each time we switch to a new AMI id
    workspace = terraform.workspace
  }

  byte_length = 4
}

# Local Variables are internal variables that can be re-used
locals {
  stack-name = "${terraform.workspace}-local-editor-${random_id.server.dec}"
  env        = terraform.workspace
  auth-namespace    = "${terraform.workspace}-local-auth-resources"
  auth-namespace-id = "${local.auth-namespace}-${random_id.server.hex}"
}


# The actual CloudformationStack for the CI/CD Pipeline
resource "aws_cloudformation_stack" "editor" {
  name = local.stack-name
  template_body = file("./template.yaml")
  parameters = {
    WebSiteBucketName = "${local.stack-name}-content"
    Environment = "local"
    NamePrefix = "LocalEditor"
    UserPoolName = "${upper(local.env)}_CMS_Local_Auth"
    SubDomain    = local.auth-namespace-id
    CMSPublishBucket = var.cms_publish_bucket
    MetadataBucket  = var.workflow_bucket
  }
  capabilities = ["CAPABILITY_IAM","CAPABILITY_AUTO_EXPAND"]

}


resource "local_file" "react-env" {
  content     = <<-EOT
VITE_IDSTACKNAME="${aws_cloudformation_stack.editor.id}"
VITE_IDENTITYPOOLID="${aws_cloudformation_stack.editor.outputs["CMSIdentityPoolId"]}"
VITE_USERPOOLID="${aws_cloudformation_stack.editor.outputs["CMSUserPoolId"]}"
VITE_CLIENTID="${aws_cloudformation_stack.editor.outputs["ClientId"]}"
VITE_LOGINDOMAIN="localhost:3000"
VITE_APPWEBDOMAIN="${local.auth-namespace-id}.auth.${var.region}.amazoncognito.com"
VITE_REDIRECTURISIGNIN='http://localhost:3000'
VITE_REDIRECTURISIGNOUT='http://localhost:3000/signout.html'
VITE_STAGEBUCKET="${aws_cloudformation_stack.editor.outputs["EditorWebSiteBucketName"]}"
VITE_STAGEPREFIX="posts/"
VITE_READYFORPUBLISHPREFIX="stage/"
VITE_PUBLISHBUCKET="${var.workflow_bucket}"
VITE_PREVIEWBUCKET="${aws_cloudformation_stack.editor.outputs["EditorPublishBucketName"]}"
VITE_EVENTBUSNAME = ""
VITE_EVENTRELEASESOURCE = ""
VITE_REGION="${var.region}"
VITE_RELEASEURL="http://localhost:3001"
VITE_MEDIAPROXY="https://${aws_cloudformation_stack.editor.outputs["EditorPublishBucketName"]}.s3.amazonaws.com/"
VITE_METADATABUCKET="${var.workflow_bucket}"
VITE_METADATAPREFIX="metadata/"
EOT
  filename = "./../.env"
}

