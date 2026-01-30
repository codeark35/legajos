import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T;

  @ApiProperty({ required: false })
  timestamp?: Date;

  constructor(success: boolean, message: string, data: T) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date();
  }
}

export class ErrorResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  errors?: any;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  path: string;

  constructor(message: string, path: string, errors?: any) {
    this.success = false;
    this.message = message;
    this.errors = errors;
    this.timestamp = new Date();
    this.path = path;
  }
}
