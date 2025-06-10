import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { AddPostDto } from './dto/add-post.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { RemovePostDto } from './dto/remove-post.dto';
import { RemoveCommentDto } from './dto/remove-comment.dto';
import { Request } from 'express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('getall')
  async getAll() {
    return this.postService.getAll();
  }

  @Post('add')
  async addPost(@Body() dto: AddPostDto, @Req() request: Request) {
    const token = request?.headers?.authorization?.split(' ')[1];
    return this.postService.addPost(dto, token);
  }

  @Post('addcomment')
  addComment(@Body() dto: AddCommentDto, @Req() request: Request) {
    const token = request?.headers?.authorization?.split(' ')[1];
    return this.postService.addComment(dto, token);
  }

  @Post('removepost')
  removePost(@Body() dto: RemovePostDto) {
    return this.postService.removePost(dto);
  }

  @Post('removecomment')
  removeComment(@Body() dto: RemoveCommentDto) {
    return this.postService.removeComment(dto);
  }
}
