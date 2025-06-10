import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('Message')
export class Message {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  postId: ObjectId;

  @Column()
  comment: string;

  @Column()
  author: string;
}
