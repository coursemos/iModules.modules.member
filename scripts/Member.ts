/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원모듈 클래스를 정의한다.
 *
 * @file /modules/member/scripts/Member.ts
 * @author youlapark <youlapark@naddle.net>
 * @license MIT License
 * @modified 2024. 11. 8.
 */
namespace modules {
    export namespace member {
        export class Member extends Module {
            $dom: Dom;

            /**
             * 모듈의 DOM 이벤트를 초기화한다.
             *
             * @param {Dom} $dom - 모듈 DOM 객체
             */
            init($dom: Dom): void {
                const context = $dom.getData('context');

                switch (context) {
                    case 'oauth.link':
                        this.initOAuthLink($dom);
                        break;
                    case 'edit':
                        /**
                         * @TODO section의 data-role에 따른 분기 처리
                         * data-role="edit" - 회원 검증
                         * data-role="edit" - 회원 정보 수정
                         */
                        const $view = Html.get('section').getAttr('data-role');

                        const $profile = Html.get('section[data-role="profile"]');
                        const member_id = $profile.getAttr('data-user-id');

                        switch ($view) {
                            case 'edit':
                                this.showEdit();
                                break;

                            case 'profile':
                                this.showProfile(member_id);
                                this.showPassword(member_id);
                                break;
                        }
                }

                super.init($dom);
            }

            /**
             * 로그인한 회원이 맞는지 검증을 한다.
             */
            async showEdit() {
                const $form = Html.get('form', this.$dom);
                const form = Form.get($form);

                Html.get('input', $form).on('input', () => {
                    const $message = Html.get('div[data-role=message]', $form);
                    $message.remove();
                });

                form.onSubmit(async () => {
                    const results = await form.submit(iModules.getProcessUrl('module', 'admin', 'login'));

                    if (results.success == true) {
                        // @TODO 로그인한 회원의 비밀번호 검증이 끝나면, 정보수정 페이지 로드하기.
                        iModules.Modal.show('로그인성공', '로그인 성공. 이제 정보수정하러가자', [
                            {
                                text: '닫기',
                                class: 'confirm',
                                handler: () => {
                                    iModules.Modal.close();
                                },
                            },
                        ]);
                    } else {
                        if (results.message) {
                            const $message = Html.create('div', { 'data-role': 'message' });
                            $message.html(results.message);
                            $form.append($message);
                        }
                        $form.shake();
                    }
                });
            }

            /**
             * 기본정보수정 페이지를 호출한다.
             *
             * @param {string} member_id - 접속한 회원의 멤버아이디
             */
            async getProfile(member_id: string): Promise<boolean> {
                const results = await Ajax.get(this.getProcessUrl('member'), {
                    member_id: member_id,
                });
                if (results.success == false) {
                    iModules.Modal.show(
                        '문제가 발생하였습니다.',
                        (results.message ?? '요청을 처리하던 중 문제가 발생하였습니다.') +
                            '<br>페이지를 새로고침하여 재시도해보시기 바랍니다.',
                        [
                            {
                                text: '페이지 새로고침',
                                class: 'confirm',
                                handler: () => {
                                    location.reload();
                                },
                            },
                        ]
                    );
                    return false;
                }
                return true;
            }

            /**
             * OAuth 계정연결 컴포넌트 이벤트를 초기화한다.
             *
             * @param {Dom} $dom - 모듈 DOM 객체
             */
            initOAuthLink($dom: Dom): void {
                Html.all('form', $dom).forEach(($form) => {
                    const form = Form.get($form);

                    form.onSubmit(async () => {
                        const results = await form.submit(this.getProcessUrl('oauth'));
                        console.log(results);
                    });
                });
            }

            /**
             * 프로필사진을 수정한다.
             *
             * @param {string} member_id - 회원 고유번호
             */
            async showProfile(member_id: string) {
                let cropper: Cropper | null = null;

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
                const $button: any = Html.get('button[data-action="photo"]');
                $button.on('click', () => {
                    iModules.Modal.show(
                        '회원사진',
                        /*
                         * @TODO 하위 태그는 모달 내 HTML 태그들를 불러오기 위해서 지정
                         * zoom-container : 프로그래스바
                         */
                        `<div data-role="container" style="width:100%; display: flex; gap: 15px; justify-content: center; align-items: center; flex-direction: column;">` +
                            `<div data-role="image" id="modalImage" style="width: 250px; height: 250px; display: block; background-image: url('${member_photo}'); background-position: 50%; background-size: 100%; border-radius: 999px; border:1px solid #4484c8"></div>` +
                            `<div data-role="zoom-container" style="display: flex; align-items:center; justify-content: space-around"><input data-role="bar" type="range" min="0" max="1" step="0.01" value="0" style="width: 200px" disabled></div>
                        </div>`,
                        [
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
                                        const file = (e.target as HTMLInputElement).files?.[0];

                                        if (file !== null || file !== undefined) {
                                            const read = new FileReader();

                                            read.onload = () => {
                                                const result = read.result as string;
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
                                                            Html.get('.cropper-view-box').setStyle(
                                                                'border-radius',
                                                                '50%'
                                                            );
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
                                    } else {
                                        console.log('이미지가 선택되지 않았습니다.');
                                    }
                                },
                            },
                        ]
                    );
                });

                /**
                 * Form 전송
                 */
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
                        iModules.Modal.show(
                            '문제가 발생하였습니다.',
                            results.message ?? '요청을 처리하던 중 문제가 발생하였습니다.',
                            [
                                {
                                    text: '확인',
                                    class: 'confirm',
                                    handler: () => {
                                        iModules.Modal.close();
                                    },
                                },
                            ]
                        );
                    }
                });
            }

            /**
             * 비밀번호 모달창을 띄운다.
             *
             * @param {string} member_id 회원 고유값
             */
            showPassword(member_id: string): void {
                const $button: any = Html.get('button[data-action="password"]').getEl();

                $button.addEventListener('click', () => {
                    iModules.Modal.show(
                        '패스워드 변경',
                        '<div><form><input name="new_password" type="password" style="width: 100%; padding: 10px; border: 1px solid #9c9c9c; line-height: 18px;" placeholder="변경할 패스워드"><input data-name="new_password_confirm" type="password" style="width: 100%; margin-top: 10px;padding: 10px; border: 1px solid #9c9c9c; line-height: 18px;" placeholder="패스워드확인"></form></div>',
                        [
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
                                handler: () => {
                                    this.updatePassword(member_id);
                                },
                            },
                        ]
                    );
                });
            }

            /**
             * 비밀번호를 변경한다.
             */
            updatePassword(member_id: string) {
                const $form = Html.get('form', this.$dom);
                const form = Form.get($form);
                form.onSubmit(async () => {
                    const results = await form.submit(this.getProcessUrl('member'), {
                        member_id: member_id,
                    });
                    if (results.success == true) {
                        iModules.Modal.show(
                            '확인',
                            '패스워드가 성공적으로 변경되었습니다.<br>다음 로그인시 부터 변경된 패스워드로 로그인이 가능합니다.',
                            [
                                {
                                    text: '확인',
                                    class: 'confirm',
                                    handler: () => {
                                        iModules.Modal.close();
                                        location.reload();
                                    },
                                },
                            ]
                        );
                    }

                    if (results.success == false) {
                        iModules.Modal.show(
                            '문제가 발생하였습니다.',
                            results.message ?? '요청을 처리하던 중 문제가 발생하였습니다.',
                            [
                                {
                                    text: '확인',
                                    class: 'confirm',
                                    handler: () => {
                                        iModules.Modal.close();
                                    },
                                },
                            ]
                        );
                    }
                });
            }

            /**
             * 로그아웃을 처리한다.
             *
             * @return {Promise<boolean>} success - 로그아웃 성공여부
             */
            async logout(): Promise<boolean> {
                const results = await Ajax.post(this.getProcessUrl('logout'));
                console.log(results);
                return results.success;
            }
        }
    }
}

/**
 * Cropper Class 선언
 */
declare class Cropper {
    constructor(
        image: HTMLImageElement,
        options?: {
            ready?(): void;
            aspectRatio?: number;
            viewMode?: number;
            cropBoxMovable?: boolean;
            background?: boolean;
            cropBoxResizable?: boolean;
            autoCropArea?: number;
            zoomOnWheel: boolean;
        }
    );
    getCroppedCanvas(options?: { width?: number; height?: number; imageSmoothingEnabled?: boolean }): HTMLCanvasElement;
    crop(): void;
    destroy(): void;
    setDragMode(mode: 'move' | 'crop' | 'none'): void;
    setCropBoxData(data: { left?: number; top?: number; width?: number; height?: number }): Cropper;
    zoomTo(ratio: number, pivot?: { x: number; y: number }): void;
    getContainerData(): {
        width: number;
        height: number;
        left: number;
        top: number;
    };
    getImageData(): {
        naturalWidth?: number;
        naturalHeight?: number;
        width?: number;
        height?: number;
        left?: number;
        top?: number;
        scaleX?: number;
        scaleY?: number;
    };
}
