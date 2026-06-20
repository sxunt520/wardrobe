export interface User {
  id: string;
  userId: number;
  userName: string;
  nickName: string;
  email?: string;
  avatar?: string;
  deptName?: string;
  roles: string[];
  permissions: string[];
}

export type BodyType = '梨形' | '苹果形' | '沙漏形' | '矩形' | '倒三角形';
export type StylePreference = string;

export interface ColorPreference {
  favoriteColors: string[];
  avoidColors: string[];
}

export interface CaptchaInfo {
  captchaEnabled: boolean;
  img: string;
  uuid: string;
}
