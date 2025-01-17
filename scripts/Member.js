/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원모듈 클래스를 정의한다.
 *
 * @file /modules/member/scripts/Member.ts
 * @author youlapark <youlapark@naddle.net>
 * @license MIT License
 * @modified 2024. 11. 15.
 */
var modules;
(function (modules) {
    let member;
    (function (member) {
        class Member extends Module {
            $dom;
            /**
             * 모듈의 DOM 이벤트를 초기화한다.
             *
             * @param {Dom} $dom - 모듈 DOM 객체
             */
            init($dom) {
                const context = $dom.getData('context');
                switch (context) {
                    case 'oauth.link':
                        this.initOAuthLink($dom);
                        break;
                    case 'edit':
                        this.showAuthCheck($dom);
                }
                super.init($dom);
            }
            /**
             * OAuth 계정연결 컴포넌트 이벤트를 초기화한다.
             *
             * @param {Dom} $dom - 모듈 DOM 객체
             */
            initOAuthLink($dom) {
                Html.all('form', $dom).forEach(($form) => {
                    const form = Form.get($form);
                    form.onSubmit(async () => {
                        const results = await form.submit(this.getProcessUrl('oauth'));
                        console.log(results);
                    });
                });
            }
            /**
             * 로그인한 회원이 맞는지 비밀번호를 통해 검증한다.
             *
             * @param {Dom} $dom - 모듈 DOM 객체
             */
            async showAuthCheck($dom) {
                const $form = Html.get('form', $dom);
                const form = Form.get($form);
                const $message = Html.get('div[data-role="message"]');
                form.onSubmit(async () => {
                    const results = await form.submit(this.getProcessUrl('login.check'));
                    if (results.success == true) {
                        const $edit = Html.get('section[data-role="edit"]');
                        $edit.empty();
                        this.showProfile();
                    }
                    else {
                        $message.setStyle('padding', '10px 0px 5px 0px');
                        $message.setStyle('font-size', '14px');
                        $message.setStyle('color', 'var(--im-color-danger-600)');
                        $message.html(results.message);
                        $form.shake();
                    }
                });
            }
            /**
             * 프로필을 수정하는 페이지를 호출한다.
             */
            async showProfile() {
                const $profile = Html.get('section[data-role="profile"]');
                const member_id = $profile.getAttr('data-user-id');
                const $container = Html.create('div', { 'data-role': 'container' });
                const $update = Html.create('div', { 'data-role': 'update' });
                const $h4 = Html.create('h4', null, '기본정보수정');
                $update.append($h4);
                const $form = Html.create('form');
                const $ul = Html.create('ul', { 'data-role': 'form' });
                const photo = $profile.getAttr('data-photo');
                const $photo_li = Html.create('li', { 'data-role': 'photo' });
                const $photo_ul = Html.create('ul');
                const $photo_li_label = Html.create('li');
                const $photo_b_label = Html.create('b', null, '회원사진');
                $photo_li_label.append($photo_b_label);
                const $photo_li_button = Html.create('li');
                const $photo_button = Html.create('button', {
                    type: 'button',
                    'data-action': 'photo',
                    style: `background-image:linear-gradient(to bottom,
                            rgba(0, 0, 0, 0) 60%,
                            rgba(0, 0, 0, 0.7) 100%),url("${photo}")`,
                });
                $photo_button.on('click', async () => {
                    await this.updatePhoto();
                });
                $photo_li_button.append($photo_button);
                $photo_ul.append($photo_li_label);
                $photo_ul.append($photo_li_button);
                $photo_li.append($photo_ul);
                $ul.append($photo_li);
                const results = await Ajax.get(this.getProcessUrl('member'), { member_id: member_id });
                const data = {
                    name: '이름',
                    email: '이메일',
                    password: '패스워드변경',
                    cellphone: '휴대전화번호',
                };
                if (results.success === true) {
                    Object.entries(results.data).forEach(([key, value]) => {
                        if (data[key]) {
                            const $li = Html.create('li', { 'data-role': `${key}` });
                            const $innerUl = Html.create('ul');
                            const $left = Html.create('li');
                            const $left_text = Html.create('b', { class: 'require' }, data[key]);
                            $left.append($left_text);
                            $innerUl.append($left);
                            const $right = Html.create('li');
                            const $right_text = Html.create('input', {
                                type: 'text',
                                name: key,
                                value: value,
                            });
                            $right.append($right_text);
                            $innerUl.append($right);
                            $li.append($innerUl);
                            $ul.append($li);
                            /**
                             * 이메일 아래 열에 패스워드를 입력하기 위해서 기재했다.
                             */
                            if (key === 'email') {
                                const $li = Html.create('li');
                                const $password = Html.create('ul', { class: 'password' });
                                const $text = Html.create('li');
                                const $b = Html.create('b', null, '패스워드');
                                $text.append($b);
                                $password.append($text);
                                const $button_li = Html.create('li');
                                const $button = Html.create('button', {
                                    'data-role': 'password',
                                    'data-action': 'password',
                                    type: 'button',
                                }, '패스워드변경');
                                $button_li.append($button);
                                $password.append($button_li);
                                $button.on('click', async () => {
                                    iModules.Modal.show('패스워드 변경', `<form class="password"><input type="hidden"><input name="password" type="password" style="width: 100%; padding: 10px; border: 1px solid #9c9c9c; line-height: 18px;" placeholder="변경할 패스워드"><input name="password_confirm" type="password" style="width: 100%; margin-top: 10px;padding: 10px; border: 1px solid #9c9c9c; line-height: 18px;" placeholder="패스워드확인"></form>`, [
                                        {
                                            text: '취소',
                                            class: 'close',
                                            handler: () => {
                                                iModules.Modal.close();
                                            },
                                        },
                                        {
                                            text: '확인',
                                            class: 'confirm',
                                            handler: async () => {
                                                this.updatePassword();
                                            },
                                        },
                                    ]);
                                });
                                $li.append($password);
                                $ul.append($li);
                            }
                        }
                    });
                }
                $form.append($ul);
                const $buttonDiv = Html.create('div', { 'data-role': 'button' });
                const $submitButton = Html.create('button', { type: 'submit' }, '확인');
                $submitButton.on('click', async () => {
                    this.updateUser(member_id);
                });
                $buttonDiv.append($submitButton);
                $form.append($buttonDiv);
                $update.append($form);
                $container.append($update);
                $profile.append($container);
            }
            /**
             * 회원정보를 수정한다.
             *
             * @param {string} member_id - 멤버 고유값
             */
            async updateUser(member_id) {
                const $form = Html.get('form', this.$dom);
                const form = Form.get($form);
                form.onSubmit(async () => {
                    const results = await form.submit(this.getProcessUrl('member'), {
                        member_id: member_id,
                    });
                    if (results.success == true) {
                        iModules.Modal.show('확인', '회원정보가 성공적으로 수정되었습니다.', [
                            {
                                text: '확인',
                                class: 'confirm',
                                handler: () => {
                                    iModules.Modal.close();
                                    location.reload();
                                },
                            },
                        ]);
                    }
                    if (results.success == false) {
                        iModules.Modal.show('문제가 발생하였습니다.', results.message ?? '요청을 처리하던 중 문제가 발생하였습니다.', [
                            {
                                text: '확인',
                                class: 'confirm',
                                handler: () => {
                                    iModules.Modal.close();
                                },
                            },
                        ]);
                    }
                });
            }
            /**
             * 프로필사진을 수정한다.
             */
            async updatePhoto() {
                let cropper = null;
                /**
                 * @TODO 기존 프로필 사진을 가져오기 위해, Attrbute로 설정한 데이터를 가져온다.
                 */
                const member_photo = Html.get('section[data-role="profile"]').getAttr('data-photo');
                /**
                 * Hidden 상태인 input 값을 가져오기 위해 지정함.
                 */
                const $photo = Html.get('li[data-role="photo"] > ul > li:nth-child(2)');
                const $input_data = Html.create('input', {
                    'type': 'hidden',
                    'data-role': 'data-image',
                    'name': 'photo',
                });
                $photo.append($input_data);
                /**
                 * 버튼 클릭 이벤트 설정
                 */
                const $button = Html.get('button[data-action="photo"]');
                $button.on('click', () => {
                    iModules.Modal.show('회원사진', 
                    /*
                     * @TODO 하위 태그는 모달 내 HTML 태그들를 불러오기 위해서 지정
                     * zoom-container : 프로그래스바
                     */
                    `<div data-role="container" style="width:100%; display: flex; gap: 15px; justify-content: center; align-items: center; flex-direction: column;">` +
                        `<div data-role="image" id="modalImage" style="width: 250px; height: 250px; display: block; background-image: url('${member_photo}'); background-position: 50%; background-size: 100%; border-radius: 999px; border:1px solid #4484c8"></div>` +
                        `<div data-role="zoom-container" style="display: flex; align-items:center; justify-content: space-around"><input data-role="bar" type="range" min="0" max="1" step="0.01" value="0" style="width: 200px" disabled></div>
                        </div>`, [
                        {
                            text: '취소',
                            class: 'close',
                            handler: () => {
                                iModules.Modal.close();
                            },
                        },
                        {
                            text: '파일선택',
                            class: 'action',
                            handler: () => {
                                const $input = Html.create('input', { 'name': 'photo', 'type': 'file' });
                                $input.on('change', (e) => {
                                    const file = e.target.files?.[0];
                                    if (file !== null || file !== undefined) {
                                        const read = new FileReader();
                                        read.onload = () => {
                                            const result = read.result;
                                            const $modalImage = Html.get('div[data-role="image"]');
                                            if ($modalImage) {
                                                $modalImage.removeAttr('style');
                                                $modalImage.setStyle('width', '250px');
                                                $modalImage.setStyle('height', '250px');
                                                $modalImage.getEl().innerHTML = '';
                                                const img = document.createElement('img');
                                                img.src = result;
                                                img.style.maxWidth = '100%';
                                                img.style.maxHeight = '100%';
                                                img.style.display = 'block';
                                                $modalImage.getEl().appendChild(img);
                                                let $bar = Html.get('div[data-role="zoom-container"] > input');
                                                $bar.setDisabled(false);
                                                if (cropper) {
                                                    cropper.destroy();
                                                }
                                                /**
                                                 * Cropper 객체 생성
                                                 */
                                                cropper = new Cropper(img, {
                                                    aspectRatio: 1,
                                                    viewMode: 3,
                                                    background: false,
                                                    cropBoxMovable: false,
                                                    cropBoxResizable: false,
                                                    autoCropArea: 0.8,
                                                    zoomOnWheel: false,
                                                    ready: () => {
                                                        const container = cropper.getContainerData();
                                                        cropper.setCropBoxData({
                                                            left: 0,
                                                            top: 0,
                                                            width: container.width,
                                                            height: container.height,
                                                        });
                                                        /**
                                                         * 파일 크롭 원형부분 CSS 설정
                                                         */
                                                        Html.get('.cropper-view-box').setStyle('border-radius', '50%');
                                                        Html.get('.cropper-face').setStyle('border-radius', '50%');
                                                        cropper.setDragMode('move');
                                                        const $progressbar = Html.get('input[data-role="bar"]');
                                                        const $el = $bar.getEl();
                                                        $el.addEventListener('input', () => {
                                                            const zoomLevel = parseFloat($progressbar.getValue());
                                                            cropper.zoomTo(zoomLevel);
                                                        });
                                                    },
                                                });
                                            }
                                        };
                                        read.onerror = () => {
                                            console.error('파일을 불러오지 못했습니다.');
                                        };
                                        read.readAsDataURL(file);
                                    }
                                });
                                $input.getEl().click();
                            },
                        },
                        {
                            text: '확인',
                            class: 'confirm',
                            handler: () => {
                                if (cropper) {
                                    const width = 500;
                                    const height = 500;
                                    const croppedCanvas = cropper.getCroppedCanvas({
                                        width: width,
                                        height: height,
                                        imageSmoothingEnabled: true,
                                    });
                                    const context = croppedCanvas.getContext('2d');
                                    if (context) {
                                        /**
                                         * 크롭한 이미지 원형 출력
                                         */
                                        context.drawImage(croppedCanvas, 0, 0);
                                        context.beginPath();
                                        context.arc(width / 2, height / 2, width / 2, 0, 2 * Math.PI);
                                        context.closePath();
                                        context.clip();
                                        /*
                                         * 자른 이미지에 대한 src 값 추출하여 보여준다.
                                         */
                                        const $result = Html.get('div[data-role="image"]').getEl();
                                        const roundedImage = new Image();
                                        roundedImage.src = croppedCanvas.toDataURL();
                                        $result.innerHTML = '';
                                        $result.appendChild(roundedImage);
                                        const $input_data = Html.get('input[data-role="data-image"]');
                                        $input_data.setValue(roundedImage.src);
                                        const $buttons = Html.get('button[data-action="photo"]');
                                        $buttons.empty();
                                        $buttons.setStyle('background-image', `url(${roundedImage.src})`);
                                    }
                                    cropper.destroy();
                                    iModules.Modal.close();
                                }
                                else {
                                    console.log('이미지가 선택되지 않았습니다.');
                                }
                            },
                        },
                    ]);
                });
            }
            /**
             * 비밀번호를 변경한다.
             */
            async updatePassword() {
                const $form = Html.get('form.password');
                const form = Form.get($form);
                const results = await form.submit(this.getProcessUrl('password'));
                if (results.success == true) {
                    iModules.Modal.show('확인', '패스워드가 성공적으로 변경되었습니다.<br>다음 로그인시 부터 변경된 패스워드로 로그인이 가능합니다.', [
                        {
                            text: '확인',
                            class: 'confirm',
                            handler: () => {
                                iModules.Modal.close();
                            },
                        },
                    ]);
                }
                else {
                    iModules.Modal.show('문제가 발생하였습니다.', '요청을 처리하던 중 문제가 발생하였습니다.<br>다시 시도해주세요.', [
                        {
                            text: '확인',
                            class: 'confirm',
                            handler: () => {
                                iModules.Modal.close();
                            },
                        },
                    ]);
                }
            }
            /**
             * 로그아웃을 처리한다.
             *
             * @return {Promise<boolean>} success - 로그아웃 성공여부
             */
            async logout() {
                const results = await Ajax.post(this.getProcessUrl('logout'));
                console.log(results);
                return results.success;
            }
        }
        member.Member = Member;
    })(member = modules.member || (modules.member = {}));
})(modules || (modules = {}));
