import { IsNotEmpty, IsString } from 'class-validator';

export class RemovePostDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
