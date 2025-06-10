import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('Posts')
export class Post {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  tittle: string;

  @Column()
  description: string;

  @Column()
  author: string;
}
