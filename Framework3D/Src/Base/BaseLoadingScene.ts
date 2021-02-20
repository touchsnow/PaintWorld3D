import BaseScene from "../Base/BaseScene";
import UIUtility from "../Base/UIUtility";
import { Prefab, _decorator, ProgressBarComponent, LabelComponent, Color, log, warn, loader, Asset, CCString } from "cc";
import sdkConfig from "../AD/sdkConfig";
import PlatformManager from "./PlatformManager";
import ASCAd from "../AD/ASCAd";
import BaseEventResolve from "../Analytics/BaseEventResolve";
import AnalyticsManager, { EAnalyticsEvent } from "../Analytics/AnalyticsManager";

const { ccclass, property } = _decorator;

@ccclass('DirAsset')
export class DirAsset {
    @property
    url: string = '';
};

@ccclass('TTEventResolve')
export class TTEventResolve {
    @property({
        displayName: 'id（变量名）',
    })
    id: string = '';

    @property({
        displayName: '事件名（中文）',
    })
    name: string = '';
};

@ccclass
export default class BaseLoadingScene extends BaseScene {
    @property({
        displayName: '广告配置文件根目录的名称',
        override: true
    })
    appName: string = null;

    @property({
        displayName: 'AppId',
        tooltip: '必填，cocos service创建的游戏ID',
    })
    cocosAppId: string = '';

    @property({
        type: Prefab,
        displayName: 'Dialog的根节点预制体',
        tooltip: '必填，请拖拽Framework3D/Res/DialogRootNode.prefab（推荐），如需定制窗口根节点，请在resources的Prefab文件夹下新建DialogRootNode节点',
        override: true
    })
    dialogRootNodePrefab: Prefab = null;
    @property({
        type: Prefab,
        displayName: 'TopTip预制体',
        tooltip: '必填，请拖拽Framework3D/Res/TopTip.prefab（推荐）',
        override: true
    })
    topTipPrefab: Prefab = null;
    @property({ type: ProgressBarComponent })
    progressBar: ProgressBarComponent = null;
    @property({ type: LabelComponent })
    progressLabel: LabelComponent = null;
    @property({ type: DirAsset })
    resDirs: DirAsset[] = [];
    @property({ type: TTEventResolve })
    ttEventResolves: TTEventResolve[] = [];

    start() {
        if (!this.appName) {
            cc.error('必须先配置广告目录');
            return;
        }
        if (!this.cocosAppId) {
            cc.warn('Cocos Service的AppId没填！！！');
            return;
        }
        //数据上报
        ASCAd.getInstance().reportMonitor();
        //广告配置文件的路径
        sdkConfig.getInstance().configUrl = `https://xiaoyudi-1259481479.cos.ap-guangzhou.myqcloud.com/BenFei/AD/${this.appName}/${PlatformManager.getInstance().getChannel()}/config.json`;
        //初始化entity
        this.onInitEntity()
        //设置toptip预制体
        UIUtility.getInstance().init(this.topTipPrefab);
        //网络检测
        let isNotOnLine: boolean = navigator && !navigator.onLine;
        // 测试用
        // isNotOnLine = true;
        if (isNotOnLine) {
            UIUtility.getInstance().showTopTips('当前无网络，请联网后重新尝试', Color.RED);
            return;
        }
        // 初始化数据统计sdk
        let es = this.getEventResolve();
        let array = [];
        for (let i = 0; i < this.ttEventResolves.length; i++) {
            const element = this.ttEventResolves[i];
            array.push([element.id, element.name]);
        }
        es.init(array);
        AnalyticsManager.getInstance().init(this.cocosAppId, es);
        // 登陆
        AnalyticsManager.getInstance().login(EAnalyticsEvent.Start);
        // 首帧事件
        AnalyticsManager.getInstance().raiseCustomEvent(EAnalyticsEvent.Success, {
            name: "场景事件",
            eventName: "首帧",
        })
        super.start();
        let isCocos240 = typeof cc.resources != 'undefined';
        let allUuids = [];
        if (isCocos240) {
            //@ts-ignore
            let map = cc.resources._config.assetInfos._map;
            for (const key in map) {
                if (Object.prototype.hasOwnProperty.call(map, key)) {
                    const element = map[key];
                    if (element.path) {
                        for (let i = 0; i < this.resDirs.length; i++) {
                            const resDir = this.resDirs[i];
                            const path = resDir.url + '/';
                            if (element.path.substr(0, path.length) === path) {
                                allUuids.push(element.path);
                                break
                            }
                        }
                    }
                }
            }
        } else {
            // 2.4之前
            const uuids = Object.keys(loader._assetTables.assets._pathToUuid);
            for (let i = 0; i < uuids.length; i++) {
                const uuid = uuids[i];
                for (let i = 0; i < this.resDirs.length; i++) {
                    const resDir = this.resDirs[i];
                    if (uuid.indexOf(resDir.url) > -1) {
                        allUuids.push(uuid);
                        break
                    }
                }
            }
        }
        // log('allUuids.length: ', allUuids.length);
        if (allUuids.length > 0) {
            if (this.progressBar) {
                this.progressBar.node.active = true;
            }
            if (this.progressLabel) {
                this.progressLabel.node.active = true;
            }
            //@ts-ignore
            UIUtility.getInstance().loadRes(allUuids, Asset, (completedCount, totalCount) => {
                let progress = completedCount / totalCount;
                if (isNaN(progress)) {
                    return;
                }
                this.setProgress(progress);
            }, (err) => {
                if (err) {
                    warn(err);
                    return;
                }
                this.scheduleOnce(() => {
                    log('loadResDir finished!!!');
                    this.onLoadResFinished();
                }, 0);
            });
        } else {
            // this.setProgress(1);
            if (this.progressBar) {
                this.progressBar.node.active = false;
            }
            if (this.progressLabel) {
                this.progressLabel.node.active = false;
            }
            this.onLoadResFinished();
        }
    }

    onInitEntity() {

    }

    onLoadResFinished() {

    }

    getEventResolve() {
        if (this.eventResolve == null) {
            this.eventResolve = new BaseEventResolve();
        }
        return this.eventResolve;
    }

    setProgress(progress) {
        if (this.progressBar) {
            this.progressBar.progress = progress;
        }
        if (this.progressLabel) {
            this.progressLabel.string = `${(progress * 100).toFixed(2)}%`;
        }
    }
}
