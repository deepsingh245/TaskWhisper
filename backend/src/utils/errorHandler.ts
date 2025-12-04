import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export default errorHandler;
