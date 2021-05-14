import { User } from "../../models/user/user.model";
import { IUser } from "../../interfaces/user/user.interface";

export interface IUserService {
    add(tg_chat_id: string): Promise<IUser | null>;
    getUserByTgId(tg_chat_id: string): Promise<IUser | null>;
}


export class UserService implements IUserService {

    constructor() {}

    public async add(tg_chat_id: string): Promise<IUser | null> {
        const user: IUser = await User.findOne({tg_chat_id});
        if (!user) {
            const newUser = new User({
                tg_chat_id,
            });
            await newUser.save();
            return newUser;
        } else {
            return null;
        }
    }

    public async getUserByTgId(tg_chat_id: string): Promise<IUser | null> {
        const user = await User.findOne({ tg_chat_id });
        return (user ?  user : null);
    }

}