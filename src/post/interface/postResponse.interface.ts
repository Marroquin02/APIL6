import { Message } from '../entities/message.entity';
import { Post } from '../entities/post.entity';

export interface PostResponseInterface extends Post {
  messages: Message[];
}
