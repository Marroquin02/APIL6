import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveCommentDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
