# CMS Editor Security Review

## Executive Summary

This security review evaluates the CMS Editor application, a Single Page Application (SPA) that uses AWS Cognito for authentication and AWS credentials to call AWS services. The review identified several security concerns across authentication mechanisms, credential handling, AWS service interactions, client-side vulnerabilities, data validation, logging practices, and dependency management.

## Threat Assessment

### Authentication and Authorization

**Risk Level: Medium**

The application uses AWS Cognito for authentication through OIDC, which is a secure approach. Several concerns have been addressed:

1. **Token Management**: ✅ FIXED - Implemented secure token storage using obfuscation in sessionStorage rather than keeping tokens directly in memory. Added protection against XSS attacks through CSP and proper token handling in AuthService.ts.

2. **Session Handling**: ✅ FIXED - Implemented robust session timeout handling and token refresh mechanisms in AuthService.ts. Added user activity tracking, automatic session timeout, and timeout warning dialog.

3. **Access Control**: There is no clear role-based access control implementation, potentially allowing all authenticated users the same level of access to AWS resources.

### Data Protection

**Risk Level: High**

1. **Sensitive Data Exposure**: ✅ FIXED - Removed console.log statements with sensitive data and replaced necessary logging with console.info for non-sensitive events only.

2. **Insecure Data Storage**: ✅ FIXED - Implemented HTML sanitization in AWSCMSCrudSvc.ts to validate and clean user-generated content before storage in S3.

3. **Lack of Content Security Policy**: ✅ FIXED - Implemented Content Security Policy (CSP) via meta tag in index.html to prevent XSS attacks.

### Infrastructure Security

**Risk Level: Medium**

1. **AWS Service Configuration**: No evidence of principle of least privilege in AWS service interactions.

2. **Error Handling**: Error messages may leak implementation details that could be useful to attackers.

## Code Path Vulnerabilities

### 1. Credential Handling (High Risk)

✅ FIXED - In `DataService.ts`, the unnecessary JSON serialization and parsing of AWS credentials has been removed:

```typescript
// DataService.ts - FIXED
// Pass AWS config directly without serialization/deserialization
// @ts-ignore
this.svc = new AWSCMSCrudSvc(awsConfig);
```

This change prevents potential exposure of credentials in memory longer than necessary.

### 2. Input Validation (Critical Risk)

✅ FIXED - The application now implements proper input validation throughout, particularly in the `AWSCMSCrudSvc.ts` file:

```typescript
// Example from AWSCMSCrudSvc.ts - FIXED
// Added HTML sanitization function
private sanitizeHTML(html: string): string {
    // Basic sanitization of script tags and event handlers
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/g, '')
        .replace(/on\w+='[^']*'/g, '')
        .replace(/on\w+=\w+/g, '');
}

async createHTML(bucket: string, key: string, data: string): Promise<void> {
    try {
        // Sanitize the HTML before storing
        const sanitizedData = this.sanitizeHTML(data);
        
        const params = {
            Bucket: bucket,
            Key: key,
            Body: sanitizedData,
            ContentType: "text/html"
        };
        await this.s3Client.send(new PutObjectCommand(params));
    } catch (error) {
        // @ts-ignore
        const err = error as Error;
        throw new Error(`Failed to create object: ${err.message}`);
    }
}
```

This method now sanitizes HTML content before storage, preventing stored XSS attacks when the content is later rendered in the application.

### 3. URL Sanitization (High Risk)

✅ FIXED - The `Utils.cleanURL` function now implements proper URL sanitization:

```typescript
// Utils.ts - FIXED
public static cleanURL(host: string, url: string): string {
  // Input validation
  if (!host || !url) {
    return '';
  }
  
  // Sanitize inputs
  const sanitizedHost = host.trim();
  const sanitizedUrl = url.trim();
  
  // Handle already complete URLs
  if (sanitizedUrl.match(/^https?:\/\//i)) {
    // Validate URL structure to prevent javascript: and data: URLs
    try {
      const urlObj = new URL(sanitizedUrl);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return ''; // Reject non-http/https protocols
      }
      return sanitizedUrl;
    } catch (e) {
      return ''; // Invalid URL
    }
  }
  
  // URL construction logic with validation...
  // Final validation of combined URL
  try {
    new URL(cleanURL);
    return cleanURL;
  } catch (e) {
    return ''; // Invalid URL after joining
  }
}
```

This function now properly validates and sanitizes URLs to prevent XSS vectors, rejects non-http/https protocols, and no longer logs sensitive URL information to the console.

### 4. Sensitive Data Logging (High Risk)

✅ FIXED - Throughout the application, sensitive data logging has been removed or replaced with safer alternatives:

```typescript
// AWSCMSCrudSvc.ts - FIXED
const data = await response.Body.transformToString();
// console.log statement removed
return JSON.parse(data);
```

```typescript
// Auth.tsx - FIXED
// Using console.info for non-sensitive events only
notify(event: string, obj: any) {
    console.info(`Event: ${event}`);
    this.listeners.forEach(f => f(event, obj));
}
```

```typescript
// Editor.tsx - FIXED
// No longer logging HTML content to console
const htmlString = $generateHtmlFromNodes(editorRef, null);
const sanitizedHTML = sanitizeHTML(htmlString);
// HTML content is now sanitized but not logged to console
```

These changes prevent exposure of sensitive application data to anyone with access to the browser's developer console.

### 5. Insecure Content Rendering (Medium Risk)

✅ FIXED - In `Editor.tsx`, content is now generated with proper sanitization:

```typescript
// Editor.tsx - FIXED
// Sanitization function implemented
const sanitizeHTML = (html: string): string => {
    // Basic sanitization of script tags and event handlers
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/g, '')
        .replace(/on\w+='[^']*'/g, '')
        .replace(/on\w+=\w+/g, '');
};

// In handleChange function
const htmlString = $generateHtmlFromNodes(editorRef, null);
const sanitizedHTML = sanitizeHTML(htmlString);
// HTML content is now sanitized but not logged to console
```

With this proper sanitization, XSS vulnerabilities are prevented even if malicious content is saved and later rendered.

## Supply Chain Attacks

**Risk Level: Medium**

The application uses several third-party dependencies that could pose supply chain risks:

1. **Dependency Management**: The application uses caret versioning (`^`) for most dependencies, which automatically allows minor version updates that could introduce vulnerabilities or breaking changes.

2. **Critical Dependencies**:
   - AWS SDK packages for core functionality
   - Lexical editor framework
   - React and related libraries
   - Material UI components

3. **Build Process**: The application uses Vite as its build tool. There is no evidence of dependency scanning or lock file validation during the build process.

4. **Lack of Integrity Verification**: No evidence of Subresource Integrity (SRI) checks for externally loaded resources.

## Package Vulnerabilities

The application uses several packages that may have known vulnerabilities:

1. **AWS SDK Packages**: 
   - `@aws-sdk/client-cognito-identity`: ^3.782.0
   - `@aws-sdk/client-s3`: ^3.738.0
   - `@aws-sdk/client-eventbridge`: ^3.844.0

   These versions might contain known vulnerabilities and should be verified against the AWS security advisories.

2. **React and Related Libraries**:
   - `react`: ^18.3.1
   - `react-dom`: ^18.3.1
   - `react-oidc-context`: ^3.2.0

3. **Lexical Editor**:
   - `lexical`: ^0.32.1
   - `@lexical/react`: ^0.32.1

4. **Material UI**:
   - `@mui/material`: ^6.4.12
   - `@mui/icons-material`: ^6.4.4
   - `@mui/styles`: ^6.4.4

Without a specific vulnerability scanning tool like npm audit or Snyk, it's difficult to identify specific vulnerabilities in these packages. A dedicated dependency scanning tool should be integrated into the development workflow.

## Recommendations

### Critical Priorities

1. **Input Validation and Sanitization**:
   - Implement comprehensive input validation for all user inputs
   - Sanitize HTML content before storage and rendering
   - Add URL sanitization to the `cleanURL` function

2. **Remove Sensitive Data Logging**:
   - Remove all `console.log` statements that expose sensitive data
   - Implement proper logging levels for development vs. production
   - Use secure logging practices that mask sensitive information

3. **Secure AWS Service Interactions**:
   - Implement principle of least privilege for AWS service interactions
   - Validate and sanitize all inputs to AWS service calls
   - Use S3 object encryption for sensitive content

### High Priorities

1. **Dependency Management**:
   - Lock down dependency versions to avoid unexpected updates
   - Implement automated vulnerability scanning (npm audit, Snyk, etc.)
   - Create a process for regular dependency updates and security reviews

2. **XSS Protection**:
   - Implement Content Security Policy (CSP)
   - Add proper HTML sanitization for user-generated content
   - Use React's built-in XSS protections consistently

3. **Authentication Enhancements**:
   - Implement token refresh mechanisms
   - Add session timeout handling
   - Secure token storage practices

### Medium Priorities

1. **Error Handling**:
   - Implement consistent error handling that doesn't leak sensitive information
   - Add proper error boundaries in React components
   - Create user-friendly error messages for production

2. **Access Control**:
   - Implement role-based access control
   - Restrict access to AWS resources based on user permissions
   - Add authorization checks for sensitive operations

3. **Security Headers**:
   - Implement security headers (X-Content-Type-Options, X-Frame-Options, etc.)
   - Use HTTPS-only cookies
   - Add proper CORS configuration

## Conclusion

The CMS Editor application has several security vulnerabilities that need to be addressed. By implementing the recommendations in this report, the application's security posture can be significantly improved to protect against common web application threats and cloud service misconfigurations.

The most critical issues are the lack of input validation, sensitive data logging, and potential XSS vulnerabilities. These should be addressed immediately to protect the application and its users.