import { proto } from "@whiskeysockets/baileys";

export interface IWAMessageParser {
    type: string;
    content: string;
    id: string|null;
    isGroup: boolean | undefined;
    sender: string;
    message: proto.IWebMessageInfo;
    isMention: boolean;
    isQuoted: boolean;
    isRep: boolean|{ message: proto.IWebMessageInfo | null } |undefined;
    msg: string;
    args: string[];
}