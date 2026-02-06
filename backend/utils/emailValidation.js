import dns from 'dns';
import { promisify } from 'util';

// Convert dns.resolveMx to promise-based
const resolveMx = promisify(dns.resolveMx);

// Common disposable email domains to block
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'temp-mail.org',
  'throwaway.email',
  'getnada.com'
];

// Validate email domain exists and accepts mail
export const validateEmailDomain = async (email) => {
  console.log(`🔍 Starting email validation for: ${email}`);
  try {
    const domain = email.split('@')[1]?.toLowerCase();
    console.log(`📧 Extracted domain: ${domain}`);
    
    if (!domain) {
      console.log(`❌ Invalid email format - no domain found`);
      return { valid: false, error: 'Invalid email format' };
    }

    // Check for disposable email services
    if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
      console.log(`❌ Disposable email domain detected: ${domain}`);
      return { valid: false, error: 'Disposable email addresses are not allowed' };
    }

    // Check for obviously fake domains
    const fakeDomains = ['test.com', 'example.com', 'fake.com', 'temp.com'];
    if (fakeDomains.includes(domain) || domain.length < 4) {
      console.log(`❌ Fake domain detected: ${domain}`);
      return { valid: false, error: 'Please use a valid email domain' };
    }

    // Check if domain has MX records (can receive email)
    console.log(`🔍 Checking MX records for domain: ${domain}`);
    try {
      const mxRecords = await resolveMx(domain);
      console.log(`📧 MX records found:`, mxRecords);
      if (!mxRecords || mxRecords.length === 0) {
        console.log(`❌ No MX records found for domain: ${domain}`);
        return { valid: false, error: 'Email domain does not accept emails' };
      }
      console.log(`✅ Domain validation passed for: ${domain}`);
      return { valid: true };
    } catch (dnsError) {
      console.log(`❌ DNS resolution failed for domain: ${domain}`, dnsError.message);
      return { valid: false, error: 'Email domain does not exist' };
    }
    
  } catch (error) {
    console.error('Email validation error:', error);
    return { valid: false, error: 'Unable to validate email domain' };
  }
};

// Quick domain check for common patterns
export const isValidEmailDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  // Must have valid TLD
  if (!domain || !domain.includes('.') || domain.endsWith('.')) {
    return false;
  }
  
  // Common valid domains
  const commonDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'icloud.com', 'protonmail.com', 'aol.com'
  ];
  
  if (commonDomains.includes(domain)) {
    return true;
  }
  
  // Check domain pattern
  const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.([a-zA-Z]{2,})$/;
  return domainPattern.test(domain);
};