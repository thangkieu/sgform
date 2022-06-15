declare type PackageInitParams = {
  /** base64 secret key for signing webhooks. If provided, enables generating signature and headers to authenticate webhook data. */
  webhookSecretKey?: string;
  /** If provided, enables the usage of the verification module. */
  verificationOptions?: VerificationOptions;
  /** Initializes public key used for verifying and decrypting in this package. If not given, will default to "production". */
  mode?: PackageMode;
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

declare type EncryptedContent = string;
declare type EncryptedAttachmentRecords = Record<string, string>;
interface DecryptParams {
  encryptedContent: EncryptedContent;
  version: number;
  verifiedContent?: EncryptedContent;
  attachmentDownloadUrls?: EncryptedAttachmentRecords;
}
declare type DecryptedContent = {
  responses: FormField[];
  verified?: Record<string, any>;
};
declare type DecryptedFile = {
  filename: string;
  content: Uint8Array;
};
declare type DecryptedAttachments = Record<string, DecryptedFile>;
declare type DecryptedContentAndAttachments = {
  content: DecryptedContent;
  attachments: DecryptedAttachments;
};

declare type EncryptedFileContent = {
  submissionPublicKey: string;
  nonce: string;
  binary: Uint8Array;
};

declare type EncryptedAttachmentContent = {
  encryptedFile: {
    submissionPublicKey: string;
    nonce: string;
    binary: string;
  };
};
declare type Keypair = {
  publicKey: string;
  secretKey: string;
};
declare type PackageMode = "staging" | "production" | "development" | "test";
declare type VerificationOptions = {
  publicKey?: string;
  secretKey?: string;
  transactionExpiry?: number;
};
declare type VerifiedAnswer = {
  fieldId: string;
  answer: string;
};
declare type VerificationSignatureOptions = VerifiedAnswer & {
  transactionId: string;
  formId: string;
};
declare type VerificationBasestringOptions = VerificationSignatureOptions & {
  time: number;
};
declare type VerificationAuthenticateOptions = VerifiedAnswer & {
  signatureString: string;
  submissionCreatedAt: number;
};
