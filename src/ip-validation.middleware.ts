import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

@Injectable()
export class IpValidationMiddleware implements NestMiddleware {
  private allowedIps: string[] = [];

  constructor() {
    dotenv.config();
    this.allowedIps = process.env.ALLOWED_IPS.split(',');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.ip;

    if (this.allowedIps.includes(clientIp)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  }
}
