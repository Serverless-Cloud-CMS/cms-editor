# Setup Function for Default Terraform and AWS
function setup() {
  echo "Enter Region for CMS Labs: (us-east-1, us-west-2, etc)"
  read n
  REGION=$n
  echo "Enter Email for CMS Labs for Build Notices:"
  read n
  echo "#Init" > .local
  chmod +x .local
  echo "export AWS_REGION=$REGION" >> .local
  echo "export AWS_DEFAULT_REGION=$REGION" >> .local
  echo "export TF_VAR_region=$REGION" >> .local
}

# Check for .local, otherwise run setup
if [[ ! -a ".local" ]];then
    setup
else
  echo "Found a .local file and will use it!  Delete .local to re-create settings for labs."
fi

. .local
export TF_VAR_branch=$(git branch |grep "*"| awk '{print $2}')
WRKSPC=$(terraform workspace list|grep "*"| awk '{print $2}')
echo "Using Terraform Workspace ${WRKSPC}"
echo "Using Branch ${TF_VAR_branch}"
echo "Init Configuration Setup in .local file.  Run terraform init to use the configuration.  Only the Bucket for state is required!"