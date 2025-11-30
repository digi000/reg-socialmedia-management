import { Response } from 'express';

export class ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  statusCode: number;

  constructor(data: T | null, message: string = 'Success', statusCode: number = 200) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
  }

  send(res: Response): Response {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data
    });
  }
}
