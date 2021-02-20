import { _decorator, Component, Node, Enum } from 'cc';
const { ccclass, property } = _decorator;

/**监听事件名字 */
enum EventName {
    Paint = "Paint"
}
enum GameMode {
    Guide,
    Normal
}

enum PaintMode{
    Normal,
    Move,
    Boom,
    FullScreen
}

@ccclass('Constants')
export class Constants {
    public static EventName = EventName
    public static GameMode = GameMode
    public static GameVer = 1.81
    public static PaintMode = PaintMode
    public static paintMode:PaintMode = null
}
