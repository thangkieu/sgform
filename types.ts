declare type DecryptedContent = {
  responses: FormField[];
  verified?: Record<string, any>;
};

declare type DecryptedContentAndAttachments = {
  content: DecryptedContent;
  attachments: DecryptedAttachments;
};

declare type FormField = {
  _id: string;
  question: string;
  fieldType: FieldType;
  isHeader?: boolean;
  signature?: string;
} & (
  | {
      answer: string;
      answerArray?: never;
    }
  | {
      answer?: never;
      answerArray: string[] | string[][];
    }
);

declare type DecryptedAttachments = Record<string, DecryptedFile>;

declare type DecryptedFile = {
  filename: string;
  content: Uint8Array;
};

declare type FieldType =
  | "section"
  | "radiobutton"
  | "dropdown"
  | "checkbox"
  | "nric"
  | "email"
  | "table"
  | "number"
  | "rating"
  | "yes_no"
  | "decimal"
  | "textfield"
  | "textarea"
  | "attachment"
  | "date"
  | "mobile"
  | "homeno";

//////
