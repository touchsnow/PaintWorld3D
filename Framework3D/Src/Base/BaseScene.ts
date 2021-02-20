import ASCAd from "../AD/ASCAd";
import AudioManager from "./AudioManager";
import DialogManager from "./DialogManager";
import UIUtility from "./UIUtility";
import { AudioClip, Prefab, Node, instantiate, v3 } from "cc";
import AnalyticsManager, { EAnalyticsEvent } from "../Analytics/AnalyticsManager";

const { ccclass, property } = cc._decorator;

// 项目是否已经初始化
let _isInitiated: boolean = false;

@ccclass
export default class BaseScene extends cc.Component {

    @property({ type: AudioClip })
    backgroundMusic: AudioClip = null;

    @property({
        type: Node,
        displayName: 'Dialog的根节点',
        tooltip: '默认空，不需要修改，如该场景需定制Dialog根节点，参考Framework3D/Src/DialogManager'
    })
    dialogRootNode: Node = null;

    @property({
        type: Prefab,
        displayName: 'Dialog的根节点预制体',
        tooltip: '默认空，不需要修改，只在loading场景设置'
    })
    dialogRootNodePrefab: Prefab = null;

    start() {
        //Dialog根节点
        if (this.dialogRootNode) {
            DialogManager.getInstance().init(this.dialogRootNode);
        } else {
            let initDialogManager: Function = (prefab, resetPrefab = false) => {
                let node = instantiate(prefab);
                node.setContentSize(cc.winSize);
                node.setPosition(v3(cc.winSize.width / 2, cc.winSize.height / 2, 0));
                node.parent = this.node;
                DialogManager.getInstance().init(node);
                if (resetPrefab) {
                    DialogManager.getInstance().setDlgRootNodePrefab(prefab);
                }
            }
            if (this.dialogRootNodePrefab != null) {
                initDialogManager(cc.instantiate(this.dialogRootNodePrefab), true);
            } else {
                if (DialogManager.getInstance().getDlgRootNodePrefab() != null) {
                    initDialogManager(DialogManager.getInstance().getDlgRootNodePrefab(), false);
                } else {
                    // 加载dialog根节点
                    UIUtility.getInstance().loadRes('Prefab/DialogRootNode', Prefab, null, (err, prefab) => {
                        if (err) {
                            cc.error(err)
                            cc.log('必须拖拽Framework3D/Res/DialogRootNode.prefab, 设置到loading场景的dialogRootNodePrefab属性');
                            return;
                        }
                        initDialogManager(prefab);
                    });
                }
            }
        }
        //背景音乐切换
        let lastClip: AudioClip = AudioManager.getInstance().getLastMusicClip();
        if (lastClip != this.backgroundMusic) {
            AudioManager.getInstance().stopMusic();
        }
        if (this.backgroundMusic) {
            AudioManager.getInstance().playMusic(this.backgroundMusic, true);
        }
        //项目初始化
        if (!_isInitiated) {
            _isInitiated = true;
            cc.log('项目初始化！');
            // 初始化广告
            ASCAd.getInstance().initAd(() => {
                this.onADInited();
            });
        }
        this.node.on('MusicStateChange', this.onMusicStateChange, this);
        this.node.on('EffectStateChange', this.onEffectStateChange, this);
        cc.game.off(cc.game.EVENT_HIDE);
        cc.game.off(cc.game.EVENT_SHOW);
        cc.game.on(cc.game.EVENT_HIDE, () => {
            // cc.log('EVENT_HIDE');
            AnalyticsManager.getInstance().login(EAnalyticsEvent.Cancel);
        });
        cc.game.on(cc.game.EVENT_SHOW, () => {
            // cc.log('EVENT_SHOW');
            AnalyticsManager.getInstance().login(EAnalyticsEvent.Start);
        })
    }

    onMusicStateChange(isOpen) {
        if (!isOpen) {
            return;
        }
        if (this.backgroundMusic) {
            AudioManager.getInstance().playMusic(this.backgroundMusic, true);
        }
    }

    onEffectStateChange(isOpen) {

    }

    onADInited() {
        cc.log('广告初始化完成！！！');
        //显示banner
        // ASCAd.getInstance().showBanner();
    }
}
