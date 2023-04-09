/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원모듈 클래스를 정의한다.
 *
 * @file /modules/member/scripts/Member.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 10.
 */
var modules;
(function (modules) {
    let member;
    (function (member) {
        class Member extends Module {
        }
        member.Member = Member;
    })(member = modules.member || (modules.member = {}));
})(modules || (modules = {}));
