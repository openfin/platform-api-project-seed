# OpenFin Service Deployment Health Check

A sample page to show health of some webservices deployed at OpenFin with [@openfin/deployment](https://www.npmjs.com/package/@openfin/deployment) package.

## Files

* https://cdn.openfin.co/tools/deployment/1.0.0/openfin-deployment.js: [@openfin/deployment](https://www.npmjs.com/package/@openfin/deployment) package for checking accessiblity to OpenFin resources.  CORS needs to be enabled for any endpoint in order for health check to work properly.
* src/example.ts: example for @openfin/deployment package as ES module.  The exmaple can be started with `npm run start`.
* index.html: example for using \<script> tag.

An example of this page is available [here](https://cdn.openfin.co/health/deployment/index.html).
