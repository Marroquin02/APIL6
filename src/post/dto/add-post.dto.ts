import { IsNotEmpty, IsString } from 'class-validator';

export class AddPostDto {
  @IsNotEmpty()
  @IsString()
  tittle: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
