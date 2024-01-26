/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원모듈 클래스를 정의한다.
 *
 * @file /modules/member/scripts/Member.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 25.
 */
var modules;
(function (modules) {
    let member;
    (function (member) {
        class Member extends Module {
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
