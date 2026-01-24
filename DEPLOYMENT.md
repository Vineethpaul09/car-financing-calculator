# Car Financing Calculator - Deployment Guide for GoDaddy

## Build Output

Your production-ready files are in the `dist/` folder.

## Files to Upload to GoDaddy

Upload **all contents** of the `dist/` folder to your GoDaddy web hosting root directory (usually `public_html`):

```
dist/
├── .htaccess          ← Security headers & SPA routing
├── assets/
│   ├── index-*.css    ← Minified styles
│   ├── index-*.js     ← Main app bundle
│   └── vendor-*.js    ← React libraries
├── favicon.svg        ← Site icon
├── index.html         ← Main HTML file
└── robots.txt         ← Search engine directives
```

## Step-by-Step GoDaddy Deployment

### Option 1: File Manager (Easiest)

1. Log in to your GoDaddy account
2. Go to **My Products** → **Web Hosting** → **Manage**
3. Click **cPanel** or **File Manager**
4. Navigate to `public_html` folder
5. **Delete** any existing files (backup first if needed)
6. Click **Upload** and upload all files from your `dist/` folder
7. Make sure `.htaccess` is uploaded (it may be hidden - enable "Show Hidden Files")

### Option 2: FTP/SFTP

1. Get FTP credentials from GoDaddy hosting panel
2. Use FileZilla or similar FTP client
3. Connect to your server
4. Navigate to `public_html`
5. Upload all contents of `dist/` folder

## Security Features Included

✅ **Content Security Policy (CSP)** - Prevents XSS attacks
✅ **X-Frame-Options** - Prevents clickjacking
✅ **X-Content-Type-Options** - Prevents MIME sniffing
✅ **Referrer Policy** - Controls referrer information
✅ **Browser Caching** - CSS/JS cached for 1 year (hashed filenames)
✅ **Gzip Compression** - Reduces file sizes
✅ **SPA Routing** - All routes redirect to index.html

## Important Notes

### SSL/HTTPS (Critical for Security)

- GoDaddy offers free SSL certificates
- Go to **cPanel** → **SSL/TLS** → **Manage SSL Sites**
- Or enable through GoDaddy's Security section
- **Always use HTTPS in production!**

### Custom Domain

Update the `robots.txt` sitemap URL after deployment:

```
Sitemap: https://yourdomain.com/sitemap.xml
```

### If .htaccess Doesn't Work

GoDaddy Linux hosting uses Apache (supports .htaccess). If you're on Windows hosting:

1. Contact GoDaddy support to enable URL rewriting
2. Or configure through the GoDaddy dashboard

## Testing After Deployment

1. Visit your domain - the calculator should load
2. Navigate through all tabs (Summary, Breakdown, Schedule, Compare, TCO, Lease)
3. Refresh the page on any tab - it should still work (SPA routing test)
4. Check browser console (F12) for any errors

## Updating the App

To deploy updates:

1. Make changes to your code
2. Run `npm run build`
3. Upload the new `dist/` folder contents (replace existing files)

## Performance Tips

- The app is already optimized with:
  - Code splitting (vendor bundle separate)
  - Minified CSS and JavaScript
  - Browser caching configured
- Consider adding a CDN if you have high traffic

## File Sizes

| File      | Size      | Gzipped  |
| --------- | --------- | -------- |
| HTML      | 1.85 KB   | 0.79 KB  |
| CSS       | 34.22 KB  | 6.78 KB  |
| App JS    | 249.67 KB | 73.09 KB |
| Vendor JS | 11.32 KB  | 4.07 KB  |

**Total (gzipped): ~85 KB** - Very fast load time!

## Troubleshooting

### Page shows 404 on refresh

- Make sure `.htaccess` was uploaded
- Check if Apache mod_rewrite is enabled
- Contact GoDaddy support if needed

### Styles not loading

- Clear browser cache (Ctrl+Shift+R)
- Check browser console for blocked resources
- Ensure all files in `assets/` folder were uploaded

### CORS errors

- The app is client-side only, no CORS issues expected
- If you add API calls later, configure CORS on the server

---

**Your app is ready for production!** 🚀
