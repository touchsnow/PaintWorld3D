import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LevelStorgeInfo')
export class LevelStorgeInfo {
    /**已经完成的数组 */
    public paintedArray:Array<string> = []
    /**是否完成过 */
    public hadFinish:boolean = false
    /**完成率 */
    public finishRate:number = 0
    /**最佳通关事件 */
    public finishTime:number = 99999
    /**当前游戏时间 */
    public currentGameTime:number = 0


}
