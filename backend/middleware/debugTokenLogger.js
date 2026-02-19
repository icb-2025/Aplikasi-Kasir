// middleware/debugTokenLogger.js

export const debugTokenLogger = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userAgent = req.headers['user-agent'] || '';
  const url = req.originalUrl;
  const RED = "\x1b[31m";
  const GREEN = "\x1b[32m";
  const YELLOW = "\x1b[33m";
  const RESET = "\x1b[0m";
  const BOLD = "\x1b[1m";
  const suspiciousKeywords = ['nmap', 'gobuster', 'sqlmap', 'dirbuster', 'nikto', 'python-requests'];
  const isScanned = suspiciousKeywords.some(keyword => 
    userAgent.toLowerCase().includes(keyword) || url.toLowerCase().includes(keyword)
  );

  if (isScanned) {
    console.log(`${RED}${BOLD}!!! [WARNING] POTENTIAL SCAN DETECTED !!!${RESET}`);
    console.log(`${RED}[SCANNER]: ${userAgent}${RESET}`);
    console.log(`${RED}[TARGET]: ${req.method} ${url}${RESET}`);
    console.log(`${RED}-------------------------------------------${RESET}`);
  } else {
    console.log(`${GREEN}[DEBUG] Incoming Request:${RESET}`, req.method, url);
  }

  if (!authHeader) {
    console.log(`${YELLOW}[[-]DEBUG] Tidak ada Authorization header.${RESET}`);
  } else {
    const token = authHeader.split(" ")[1];
    if (token) {
      console.log(`${GREEN}[[+]DEBUG] Authorization header ditemukan:${RESET}`);
      console.log(`Token: ${token.substring(0, 40)}...`);
    }
  }

  next();
};
