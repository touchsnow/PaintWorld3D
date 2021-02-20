import { _decorator, Component, Node, Color, Vec3, game } from 'cc';
const { ccclass } = _decorator;

@ccclass('ModelAttribute')
export class ModelAttribute {

    /**原始颜色 */
    public albedoScale: Vec3 = new Vec3()
    /**灰度颜色 */
    public garyValue: Vec3 = new Vec3()
    /**号牌大小 */
    public boardScale: Vec3 = new Vec3()

}
