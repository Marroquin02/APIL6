import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Message } from './entities/message.entity';
import { AddPostDto } from './dto/add-post.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { RemovePostDto } from './dto/remove-post.dto';
import { ObjectId } from 'mongodb';
import { User } from 'src/auth/entities/user.entity';
import { RemoveCommentDto } from './dto/remove-comment.dto';
import { PostResponseInterface } from './interface/postResponse.interface';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: {
    carnet: string;
    nombre: string;
    correo: string;
    password: string;
  };
}

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: MongoRepository<Post>,

    @InjectRepository(Message)
    private readonly messageRepository: MongoRepository<Message>,

    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,

    private readonly jwt: JwtService,
  ) {}

  async getAll() {
    const posts = await this.postRepository.find();

    for (const post of posts) {
      const user = await this.userRepository.findOneBy({ carnet: post.author });
      if (user) {
        const nombre = user.nombre.split(' ');
        post.author = `${nombre[0]} ${nombre[1]}`.toLowerCase();
      }

      const mensajes = await this.messageRepository.find({
        where: { postId: post._id.toString() },
      });

      for (const msg of mensajes) {
        const user = await this.userRepository.findOneBy({
          carnet: msg.author,
        });
        if (user) {
          const nombre = user.nombre.split(' ');
          msg.author = `${nombre[0]} ${nombre[1]}`.toLowerCase();
        }
      }

      (post as PostResponseInterface).messages = mensajes;
    }

    return posts.reverse();
  }

  async addPost(dto: AddPostDto, token?: string) {
    const payload = this.getUserFromToken(token || '');
    if (!payload) return { status: 'error', message: 'Usuario no encontrado' };
    const user = payload.sub;

    console.log(user);

    const post = this.postRepository.create({
      ...dto,
      author: user.carnet,
    });
    await this.postRepository.insertOne(post);
    return { status: 'success', message: 'Post added successfully' };
  }

  async addComment(dto: AddCommentDto, token?: string) {
    const payload = this.getUserFromToken(token || '');
    if (!payload) return { status: 'error', message: 'Usuario no encontrado' };
    const user = payload.sub;

    const post = await this.postRepository.findOneBy({
      _id: new ObjectId(dto.postId),
    });
    if (!post) return { status: 'error', message: 'Post inexistente' };

    const message = this.messageRepository.create({
      postId: dto.postId,
      comment: dto.comment,
      author: user.carnet,
    });

    await this.messageRepository.insertOne(message);
    return { status: 'success', message: 'Message added successfully' };
  }

  async removePost(dto: RemovePostDto) {
    const result = await this.postRepository.findOneAndDelete({
      _id: new ObjectId(dto?.id || ''),
    });
    if (!result?.value) return { status: 'error', message: 'Post inexistente' };

    const deleteResult = await this.messageRepository.deleteMany({
      postId: dto?.id || '',
    });
    if (!deleteResult.acknowledged) {
      throw new Error('Failed to delete messages');
    }
    return { status: 'success', message: 'Post removed successfully' };
  }

  async removeComment(dto: RemoveCommentDto) {
    const result = await this.messageRepository.findOneAndDelete({
      _id: new ObjectId(dto.id),
    });
    if (!result?.value)
      return { status: 'error', message: 'Message inexistente' };

    return { status: 'success', message: 'Message removed successfully' };
  }

  private getUserFromToken(token: string): JwtPayload | null {
    try {
      const payload = this.jwt.verify<JwtPayload>(token, {
        secret: 'secret',
      });
      return payload || null;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }
}
