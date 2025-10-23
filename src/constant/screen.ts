export class ScreenConstant {
  static STATUS_ONLINE = 1;
  static STATUS_OFFLINE = 2;

  static SCREEN_INFO_INDOORS = "Indoors";
  static SCREEN_INFO_OUTDOORS = "Outdoors";
  static SCREEN_INFO_INTERACTIVE = "Interactive Display";

  static getStatusOptions() {
    return [
      {
        value :this.STATUS_ONLINE,
        label: "Online"
      },
      {
        value: this.STATUS_OFFLINE,
        label:"Offline"
      }
    ]
  }

  static getScreenInfoOptions() {
    return {
      [this.SCREEN_INFO_INDOORS]: "Indoors",
      [this.SCREEN_INFO_OUTDOORS]: "Outdoors",
      [this.SCREEN_INFO_INTERACTIVE]: "Interactive Display",
    };
  }
}
