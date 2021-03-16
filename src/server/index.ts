import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import path from 'path';
import Bundler from 'parcel-bundler';

export default class {
  protected app: express.Application;

  constructor(ENV = 'development', PORT = '8080') {
    this.app = express();

    // middleware
    if (ENV === 'production') {
      this.app.use(helmet());
      this.app.use(compression());
    } else {
      const bundler = new Bundler(path.join(process.cwd(), 'src/client/**'), {
        hmr: true,
        watch: true,
        sourceMaps: true,
        outDir: 'public',
        publicUrl: '.',
      });
      this.app.use(bundler.middleware());
    }

    // serve static files
    this.app.use(express.static(path.join(process.cwd(), 'public')));

    // fallback route
    this.app.get('*', (req: express.Request, res: express.Response) => {
      res.status(404).sendFile(path.join(process.cwd(), 'public/404.html'));
    });

    // start the server
    this.app.listen(PORT, function () {
      console.log('The server is running in port localhost: ', PORT);
    });
  }
}
