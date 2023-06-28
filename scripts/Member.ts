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
namespace modules {
    export namespace member {
        export class Member extends Module {
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
