export enum PlatformType {
  NONE,
  OPPO,
  VIVO,
  TT,
}

export default class PlatformManager {
  private static instance: PlatformManager;

  /**
   * PlatformManager 单例
   */
  public static getInstance(): PlatformManager {
    if (!PlatformManager.instance) {
      PlatformManager.instance = new PlatformManager();
    }
    return PlatformManager.instance;
  }

  private constructor() {
    //@ts-ignore
    if (typeof qg != "undefined") {
      //@ts-ignore
      this.channel = qg.getProvider().toLocaleLowerCase();
      this.type = PlatformType[this.channel.toLocaleUpperCase()];
      //@ts-ignore
    } else if (typeof tt != "undefined") {
      this.channel = 'tt';
      this.type = PlatformType.TT;
    }
  }

  private channel = 'local';

  private type = PlatformType.NONE;
  
  public getChannel() {
    return this.channel;
  }

  public getType() {
    return this.type;
  }

  public isOppo() {
    return this.type == PlatformType.OPPO;
  }

  public isVivo() {
    return this.type == PlatformType.VIVO;
  }

  public isTT() {
    return this.type == PlatformType.TT;
  }
}