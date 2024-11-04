/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원모듈 클래스를 정의한다.
 *
 * @file /modules/member/scripts/Member.ts
 * @author parkyoula <youlapark@naddle.net>
 * @license MIT License
 * @modified 2024. 11. 4.
 */
namespace modules {
    export namespace member {
        export class Member extends Module {
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
                        this.initCropper();
                        break;
                }

                super.init($dom);
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
             * 로그아웃을 처리한다.
             *
             * @return {Promise<boolean>} success - 로그아웃 성공여부
             */
            async logout(): Promise<boolean> {
                const results = await Ajax.post(this.getProcessUrl('logout'));
                console.log(results);
                return results.success;
            }

            /**
             * Cropper.js 이벤트를 발생시킨다.
             */
            initCropper(): void {
                let cropper: Cropper | null = null;

                const $button: any = Html.get('button[data-action="photo"]').getEl();

                $button.addEventListener('click', () => {
                    const $input = Html.create('input', { 'type': 'file', 'accept': 'image/*' });
                    $input.setStyle('display', 'none');

                    const $selectImage = $input.getEl();

                    iModules.Modal.show(
                        '회원사진',
                        '<div style="display: flex; justify-content: center; margin-bottom: 15px;">' +
                            '<div data-role="image" id="modalImage" style="max-width: 100%; display: none;"></div></div>' +
                            '<div style="display: none;" data-role="result"></div>',
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
                                    $selectImage.click();
                                },
                            },
                            {
                                text: '확인',
                                class: 'confirm',
                                /**
                                 * 크롭된 이미지를 가져와 원형 마스킹 적용 후 최종적인 결과를 표시하고 저장한다.
                                 */
                                handler: () => {
                                    if (cropper) {
                                        const croppedCanvas = cropper.getCroppedCanvas();

                                        const roundCanvas = document.createElement('canvas');
                                        const width = (roundCanvas.width = 252);
                                        const height = (roundCanvas.height = 252);
                                        const context = roundCanvas.getContext('2d');

                                        if (context) {
                                            context.imageSmoothingEnabled = true;
                                            context.drawImage(croppedCanvas, 0, 0, width, height);
                                            context.beginPath();
                                            context.arc(
                                                width / 2,
                                                height / 2,
                                                Math.min(width, height) / 2,
                                                0,
                                                2 * Math.PI,
                                                true
                                            );
                                            context.closePath();
                                            context.clip();

                                            const result = Html.get('div[data-role="result"]').getEl();
                                            const roundedImage = new Image();
                                            roundedImage.src = roundCanvas.toDataURL();
                                            result.innerHTML = '';
                                            result.appendChild(roundedImage);

                                            const data = roundCanvas.toDataURL();
                                            const $buttons = Html.get('button[data-action="photo"]');
                                            $buttons.empty();
                                            $buttons.setStyle('background-image', `url(${data})`);
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

                    /**
                     * 파일을 로드하고 Cropper를 초기화한다. 크롭 가능한 상태로 만든다.
                     */
                    $selectImage.addEventListener('change', (e) => {
                        // file : 마지막수정일자, 파일명, 파일사이즈, 파일타입
                        const file = (e.target as HTMLInputElement).files?.[0];

                        if (file !== null || file !== undefined) {
                            const read = new FileReader();

                            read.onload = () => {
                                const result = read.result as string;

                                const $modalImage = Html.get('div[data-role="image"]');
                                if ($modalImage) {
                                    $modalImage.setStyle('background-image', `url(${result})`).show();
                                    $modalImage.getEl().innerHTML = '';
                                    const imgElement = document.createElement('img');
                                    imgElement.src = result;
                                    $modalImage.getEl().appendChild(imgElement);

                                    cropper = new Cropper(imgElement, {
                                        aspectRatio: 1,
                                        viewMode: 1,
                                        background: false,
                                        ready: () => {
                                            Html.get('.cropper-view-box')?.setStyle('border-radius', '50%');
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
                });
            }
        }
    }
}

/**
 * Cropper Class Declare
 */
declare class Cropper {
    constructor(
        image: HTMLImageElement,
        options?: {
            ready?(): void;
            aspectRatio?: number;
            viewMode?: number;
            background?: boolean;
        }
    );
    getCroppedCanvas(options?: { width?: number; height?: number }): HTMLCanvasElement;
    crop(): void;
    destroy(): void;
}
