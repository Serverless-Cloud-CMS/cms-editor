import { CognitoIdentityClient, GetIdCommand, GetCredentialsForIdentityCommand } from "@aws-sdk/client-cognito-identity";
import {config} from "../config";
import {AWSCMSCrudSvc} from "./AWSCMSCrudSvc";
import {ICMSCrudService} from "./ICMSCrudService";

class DataService {
    private svc: ICMSCrudService | null;
    private ready: boolean;

    constructor(service_instance: ICMSCrudService | null = null) {
        this.svc = service_instance;
        this.ready = false;
    }

    isReady(): boolean {
        return this.ready;
    }

    /**
     * Initialize the AWS Service
     * @param token - The authentication token
     * @returns {Promise<void>}
     */
    async init(token: string): Promise<void> {
        const cognitoClient = new CognitoIdentityClient({ region: config.Region });

        const getIdCommand = new GetIdCommand({
            IdentityPoolId: config.AuthConfig.IdentityPoolId,
            Logins: {
                [`cognito-idp.${config.Region}.amazonaws.com/${config.AuthConfig.UserPoolId}`]: token
            }
        });

        const identityId = await cognitoClient.send(getIdCommand);
        const getCredentialsCommand = new GetCredentialsForIdentityCommand({
            IdentityId: identityId.IdentityId,
            Logins: {
                [`cognito-idp.${config.Region}.amazonaws.com/${config.AuthConfig.UserPoolId}`]: token
            }
        });

        const credentials = await cognitoClient.send(getCredentialsCommand);

        const awsConfig = {
            region: config.Region,
            credentials: {
                accessKeyId: credentials.Credentials!.AccessKeyId,
                secretAccessKey: credentials.Credentials!.SecretKey,
                sessionToken: credentials.Credentials!.SessionToken
            }
        };

        // Pass AWS config directly without serialization/deserialization
        // @ts-expect-error AWS Cast Issue
        this.svc = new AWSCMSCrudSvc(awsConfig);

        this.ready = true;
    }

    getService(): ICMSCrudService {
        if (!this.svc) {
            throw new Error("Service not initialized. Call init() first.");
        }
        if (!this.ready) {
            throw new Error("Service is not ready yet. Please wait for initialization.");
        }
        return this.svc;
    }

}

export default DataService;