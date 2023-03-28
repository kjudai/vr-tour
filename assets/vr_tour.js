// VR modeの制御用
let vr_mode = 'none';

// 移動用サークル作成
AFRAME.registerComponent('warp_circle', {
    schema: {
        link: {type: 'asset', default: ''}
    },

    init: function () { // コンポーネントが作成されると実行される
        const data = this.data;
        const el = this.el;
        el.setAttribute('class', 'clickable');
        el.addEventListener('click', function () {
            // 画面の回転角をqueryで追加して伝える。
            const sky = document.querySelector('a-sky');
            let sendRotationY = Math.round(sky.getAttribute('rotation').y);
            if (vr_mode != 'on') {
                const camera = document.querySelector('a-camera');
                sendRotationY -= Math.round(camera.getAttribute('rotation').y);
            }
            sendRotationY = sendRotationY % 360;
            if (sendRotationY<0) {sendRotationY += 360;}
            location.href = data.link + '?vr=' + vr_mode + '&orient=' + String(sendRotationY); 
        });
        // 形状の指定（円と大きさ、透明度）
        el.setAttribute('geometry', 'primitive: circle; radius: 4.0;');
        el.setAttribute('rotation', '-90 0 0');
        el.setAttribute('material', {
                            side: 'double',
                            color: '#FFF',
                            depthTest: false,
                            transparent: true,
                            opacity: 0.5
                        });
        // アニメーションの指定（マウスイン・アウトの色変化）
        el.setAttribute('animation__in', {
                            property: 'components.material.material.color',
                            type: 'color',
                            dur: 100,
                            to: '#00F',
                            startEvents: 'mouseenter'
                        });
        el.setAttribute('animation__out', {
                            property: 'components.material.material.color',
                            type: 'color',
                            dur: 100,
                            to: '#FFF',
                            startEvents: 'mouseleave'
                        });
    }
});  

// Oculusコントローラーの設定
AFRAME.registerComponent('vr-controller', {
    init: function() {
        const el = this.el;
        el.triggerState = false; // レーザービームの発射
        el.stickState = false; // スティックコントローラー制御用
        el.stickX = 0.0;
        el.setAttribute('raycaster', {
            far: 2000,
            lineColor: '#ff8',
            showLine: false
        });
        el.addEventListener('triggerdown', function() {
            el.triggerState = true;
        });
        el.addEventListener('triggerup', function() {
            el.triggerState = false;
        });
        el.addEventListener('thumbstickmoved', function(event) {
            el.stickX = event.detail.x;
        });    
    },

    tick: function() {
        let el = this.el;
        // レーザービームのON・OFF
        el.setAttribute('raycaster', 'showLine', el.triggerState);

        // スティックコントローラーの処理
        if (el.stickX < -0.95) {
            if (!(el.stickState)) {
                let sky = document.querySelector('a-sky');
                let skyRotationY = sky.getAttribute('rotation').y;
                sky.setAttribute('rotation', {y: skyRotationY - 45});
                el.stickState = true;
            }
        } else if (el.stickX > 0.95) {
            if (!(el.stickState)) {
                let sky = document.querySelector('a-sky');
                let skyRotationY = sky.getAttribute('rotation').y;
                sky.setAttribute('rotation', {y: skyRotationY + 45});
                el.stickState = true;
            }
        } else {
            el.stickState = false;
        }
    }
  });

// ホームボタンに戻る処理
AFRAME.registerComponent('home_btn', {
    init: function() {
        const el = this.el;
        el.setAttribute('class', 'clickable');
        el.setAttribute('position', {x: -1.0, y: -3.5, z: -5.0});
        el.setAttribute('geometry', {height: 0.75, width: 0.75});
        el.addEventListener('click', function () {
            location.href = '../index.html';
        });
    }
});

// インフォメーションボードの処理
let title_data = '';  //ボードのタイトル格納
let content_data = ''; //ボードの中身格納

function createInfo () { //ボード作成
    const infoBtn = document.getElementById('info_btn');
    const camera = document.querySelector('a-camera');

    const infoBox = document.createElement('a-plane');
    camera.appendChild(infoBox);
    infoBox.setAttribute('id', 'infoBox');
    infoBox.setAttribute('position', '0 0 -5.01');
    infoBox.setAttribute('geometry', {height: 4.6, width: 4.6});
    infoBox.setAttribute('color', '#242');
    const infoWindow = document.createElement('a-plane');
    camera.appendChild(infoWindow);
    infoWindow.setAttribute('class', 'clickable');
    infoWindow.setAttribute('id', 'infoWindow');
    infoWindow.setAttribute('position', '0 -0.25 -5');
    infoWindow.setAttribute('geometry', {height: 4.0, width: 4.5});
    infoWindow.setAttribute('color', 'white');

    const title = document.createElement('a-text');
    infoBox.appendChild(title);
    title.setAttribute('position', '0.0 2.05 0.0');
    title.setAttribute('width', 4.2);
    title.setAttribute('scale', '1.4 1.4 1');
    title.setAttribute('align', 'center');
    title.setAttribute('font', '../assets/NotoSansJP-Regular.json');
    title.setAttribute('font-image', '../assets/NotoSansJP-Regular.png');
    title.setAttribute('color', 'white');
    title.setAttribute('value', title_data);

    const content = document.createElement('a-text');
    infoWindow.appendChild(content);
    content.setAttribute('width', 4.2);
    content.setAttribute('position', '-2.1 1.8 0.0');
    content.setAttribute('scale', '1.0 1.0 1');
    content.setAttribute('baseline', 'top');
    content.setAttribute('font', '../assets/NotoSansJP-Regular.json');
    content.setAttribute('font-image', '../assets/NotoSansJP-Regular.png');
    content.setAttribute('color', 'black');
    content.setAttribute('wrap-count', 32);
    content.setAttribute('lineHeight', '80');
    content.setAttribute('value', content_data);

    infoWindow.addEventListener('click', removeInfo);
    infoBtn.removeEventListener('click', createInfo);
    infoBtn.addEventListener('click', removeInfo);
}

function removeInfo () { //ボード削除
    const infoBtn = document.getElementById('info_btn');
    const camera = document.querySelector('a-camera');
    const infoWindow = document.getElementById('infoWindow');
    const infoBox = document.getElementById('infoBox');
    camera.removeChild(infoWindow);
    camera.removeChild(infoBox);
    infoBtn.removeEventListener('click', removeInfo);
    infoBtn.addEventListener('click', createInfo);
}

// インフォメーションボードの初期設定
AFRAME.registerComponent('info_window', {
    schema: {
        title: {type: 'string', default: ''},
        content: {type: 'string', default: ''}
    },

    init: function() {
        const data = this.data;
        title_data = data.title;
        content_data = data.content;
        const infoBtn = document.getElementById('info_btn');
        infoBtn.setAttribute('position', {x: 0.0, y: -3.5, z: -5.0});
        infoBtn.setAttribute('geometry', {height: 0.75, width: 0.75});
        infoBtn.setAttribute('visible', 'true');
        infoBtn.setAttribute('class', 'clickable');
        infoBtn.addEventListener('click', createInfo);
    }
});

// 音声案内の処理
function playVoice () { //音声スタート
    const audioBtn = document.getElementById('audio_btn');
    const voicePlay = document.querySelector('a-sound').components.sound;
    voicePlay.playSound();
    audioBtn.setAttribute('src', '#audio_off_img');
    audioBtn.removeEventListener('click', playVoice);
    audioBtn.addEventListener('click', stopVoice);
}

function stopVoice () { //音声ストップ
    const audioBtn = document.getElementById('audio_btn');
    const voicePlay = document.querySelector('a-sound').components.sound;
    voicePlay.stopSound();
    audioBtn.setAttribute('src', '#audio_on_img');
    audioBtn.removeEventListener('click', stopVoice);
    audioBtn.addEventListener('click', playVoice);
}

// 音声案内の初期設定
AFRAME.registerComponent('voice', {
    init: function() {
        const audioBtn = document.getElementById('audio_btn');
        audioBtn.setAttribute('position', {x: 1.0, y: -3.5, z: -5.0});
        audioBtn.setAttribute('geometry', {height: 0.75, width: 0.75});
        audioBtn.setAttribute('class', 'clickable');
        audioBtn.addEventListener('click', playVoice);
        audioBtn.setAttribute('visible', 'true');
    }
});

// a-scene全体の初期化処理
function initScene () { 
    // quetyを元に表示させる方向を設定する。
    const recieveRotationY = parseFloat(AFRAME.utils.getUrlParameter('orient'));
    if (recieveRotationY>0) {
        const sky = document.querySelector('a-sky');
        sky.setAttribute('rotation', {y: recieveRotationY});
    }

    const sceneEl = document.querySelector('a-scene');
    if (AFRAME.utils.getUrlParameter('vr')=='on') {
        vr_mode = 'on';
        sceneEl.enterVR();
    } else {
        //sceneEl.exitVR();
        if (AFRAME.utils.device.checkHeadsetConnected()) {
            vr_mode = 'off';
        }
        if (AFRAME.utils.device.isMobile()) {
            vr_mode = 'none';
        }
    }
    
    // Oculus Quest 2の場合は、VRボタンの有効化
    const vrBtn = document.getElementById('vr_btn');
    vrBtn.setAttribute('class', 'clickable');
    vrBtn.setAttribute('position', {x: 2.0, y: -3.5, z: -5.0});
    vrBtn.setAttribute('geometry', {height: 0.75, width: 0.75});    
    if (vr_mode == 'off') {
        vrBtn.addEventListener('click', function () {
            vrBtn.setAttribute('visible', 'false');
            vr_mode = 'on';
            document.querySelector('a-scene').enterVR();
        });
    } else {
        vrBtn.setAttribute('visible', 'false');
    }

};

// a-sceceの読み込み・初期化がすべて終わってからinitSceneを実行
document.addEventListener('DOMContentLoaded', function () {
    const sceneEl = document.querySelector('a-scene');
    sceneEl.addEventListener('renderstart', initScene);
});