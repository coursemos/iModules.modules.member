/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 UI 이벤트를 관리하는 클래스를 정의한다.
 *
 * @file /modules/member/admin/scripts/MemberAdmin.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 28.
 */
var modules;
(function (modules) {
    let member;
    (function (member) {
        class MemberAdmin extends Admin.Interface {
        }
        member.MemberAdmin = MemberAdmin;
    })(member = modules.member || (modules.member = {}));
})(modules || (modules = {}));
