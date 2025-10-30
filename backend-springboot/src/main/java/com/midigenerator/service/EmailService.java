package com.midigenerator.service;

import com.midigenerator.security.RateLimiter;
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * ✅ FIXED: Using SendGrid HTTP API instead of SMTP
 * This works on Render and avoids SMTP port blocking issues
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final RateLimiter rateLimiter;

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.name:MIDI Generator}")
    private String appName;

    /**
     * ✅ Rate limit - max 3 emails per hour per recipient
     */
    private void checkRateLimit(String toEmail) {
        String rateLimitKey = "email:" + toEmail.toLowerCase();
        if (!rateLimiter.isAllowed(rateLimitKey, 3, 3600)) {
            log.warn("⚠️ Email rate limit exceeded for: {}", toEmail);
            throw new RuntimeException("Too many email requests. Please try again in an hour.");
        }
    }

    /**
     * ✅ Send verification email using SendGrid API
     */
    public void sendVerificationEmail(String toEmail, String token) {
        try {
            checkRateLimit(toEmail);

            log.info("📧 Preparing verification email for: {}", toEmail);

            if (toEmail == null || toEmail.trim().isEmpty()) {
                throw new IllegalArgumentException("Recipient email cannot be empty");
            }

            if (token == null || token.trim().isEmpty()) {
                throw new IllegalArgumentException("Verification token cannot be empty");
            }

            String verificationLink = frontendUrl + "/verify-email?token=" + token;
            log.info("🔗 Verification link generated for: {}", toEmail);

            // ✅ Build email using SendGrid API
            Email from = new Email(fromEmail, appName);
            Email to = new Email(toEmail);
            String subject = "Verify Your Email - " + appName;
            Content content = new Content("text/html", buildVerificationEmailHtml(verificationLink));
            Mail mail = new Mail(from, subject, to, content);

            // ✅ Send via SendGrid HTTP API
            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            log.info("📤 Sending verification email to: {}", toEmail);
            Response response = sg.api(request);

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("✅ Verification email sent successfully to: {} (Status: {})", 
                    toEmail, response.getStatusCode());
            } else {
                log.error("❌ SendGrid API error: Status {}, Body: {}", 
                    response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to send email: " + response.getBody());
            }

        } catch (IOException e) {
            log.error("❌ SendGrid API IOException: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send verification email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error sending verification email: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send verification email: " + e.getMessage(), e);
        }
    }

    /**
     * ✅ Send password reset email using SendGrid API
     */
    public void sendPasswordResetEmail(String toEmail, String token, String fullName) {
        try {
            checkRateLimit(toEmail);

            log.info("📧 Preparing password reset email for: {}", toEmail);

            if (toEmail == null || toEmail.trim().isEmpty()) {
                throw new IllegalArgumentException("Recipient email cannot be empty");
            }

            if (token == null || token.trim().isEmpty()) {
                throw new IllegalArgumentException("Reset token cannot be empty");
            }

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            log.info("🔗 Reset link generated for: {}", toEmail);

            Email from = new Email(fromEmail, appName);
            Email to = new Email(toEmail);
            String subject = "Reset Your Password - " + appName;
            Content content = new Content("text/html", buildPasswordResetEmailHtml(resetLink, fullName));
            Mail mail = new Mail(from, subject, to, content);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            log.info("📤 Sending password reset email to: {}", toEmail);
            Response response = sg.api(request);

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("✅ Password reset email sent successfully to: {} (Status: {})", 
                    toEmail, response.getStatusCode());
            } else {
                log.error("❌ SendGrid API error: Status {}, Body: {}", 
                    response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to send email: " + response.getBody());
            }

        } catch (IOException e) {
            log.error("❌ SendGrid API IOException: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Unexpected error sending password reset email: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage(), e);
        }
    }

    private String buildVerificationEmailHtml(String verificationLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                        line-height: 1.6; 
                        color: #333;
                        background-color: #f5f5f5;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 20px auto; 
                        background-color: white;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header { 
                        background-color: #1a1a1a; 
                        color: white; 
                        padding: 30px 20px; 
                        text-align: center;
                    }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 40px 30px; }
                    .content h2 { color: #1a1a1a; margin-top: 0; }
                    .button { 
                        display: inline-block; 
                        padding: 14px 32px; 
                        background-color: #1a1a1a; 
                        color: white !important; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        margin: 25px 0;
                        font-weight: 600;
                    }
                    .link-box {
                        word-break: break-all; 
                        background-color: #f5f5f5; 
                        padding: 15px; 
                        border-radius: 4px;
                        font-size: 12px;
                        color: #666;
                        margin: 20px 0;
                    }
                    .footer { 
                        text-align: center; 
                        font-size: 12px; 
                        color: #666; 
                        padding: 20px;
                        background-color: #f9f9f9;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 12px;
                        margin: 20px 0;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎵 MIDI Generator</h1>
                    </div>
                    <div class="content">
                        <h2>Verify Your Email Address</h2>
                        <p>Thank you for signing up! To start generating AI-powered music, please verify your email address by clicking the button below.</p>
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        
                        <center>
                            <a href="%s" class="button">Verify Email Address</a>
                        </center>
                        
                        <p style="margin-top: 30px;">Or copy and paste this link in your browser:</p>
                        <div class="link-box">%s</div>
                        
                        <div class="warning">
                            <strong>⚠️ Important:</strong> You won't be able to generate music until you verify your email.
                        </div>
                    </div>
                    <div class="footer">
                        <p>If you didn't create this account, please ignore this email.</p>
                        <p style="margin-top: 10px;">© 2025 MIDI Generator. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(verificationLink, verificationLink);
    }

    private String buildPasswordResetEmailHtml(String resetLink, String fullName) {
        String greeting = (fullName != null && !fullName.trim().isEmpty())
                ? "Hi " + fullName + ","
                : "Hi,";

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                        line-height: 1.6; 
                        color: #333;
                        background-color: #f5f5f5;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 20px auto; 
                        background-color: white;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header { 
                        background-color: #1a1a1a; 
                        color: white; 
                        padding: 30px 20px; 
                        text-align: center;
                    }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 40px 30px; }
                    .content h2 { color: #1a1a1a; margin-top: 0; }
                    .button { 
                        display: inline-block; 
                        padding: 14px 32px; 
                        background-color: #1a1a1a; 
                        color: white !important; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        margin: 25px 0;
                        font-weight: 600;
                    }
                    .link-box {
                        word-break: break-all; 
                        background-color: #f5f5f5; 
                        padding: 15px; 
                        border-radius: 4px;
                        font-size: 12px;
                        color: #666;
                        margin: 20px 0;
                    }
                    .footer { 
                        text-align: center; 
                        font-size: 12px; 
                        color: #666; 
                        padding: 20px;
                        background-color: #f9f9f9;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎵 MIDI Generator</h1>
                    </div>
                    <div class="content">
                        <h2>Password Reset Request</h2>
                        <p>%s</p>
                        <p>We received a request to reset your password. Click the button below to create a new password.</p>
                        <p><strong>This link will expire in 1 hour.</strong></p>
                        
                        <center>
                            <a href="%s" class="button">Reset Password</a>
                        </center>
                        
                        <p style="margin-top: 30px;">Or copy and paste this link in your browser:</p>
                        <div class="link-box">%s</div>
                        
                        <div class="warning">
                            <strong>⚠️ Security Note:</strong> If you didn't request this password reset, please ignore this email or contact our support team. Your account is safe.
                        </div>
                    </div>
                    <div class="footer">
                        <p>For security reasons, never share this link with anyone.</p>
                        <p style="margin-top: 10px;">© 2025 MIDI Generator. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(greeting, resetLink, resetLink);
    }
}