import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    role: string;

    @Column({ nullable: true })
    hashedPassword: string;
}
