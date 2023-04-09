<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리자 클래스를 정의한다.
 *
 * @file /modules/member/admin/MemberAdmin.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 10.
 */
namespace modules\member\admin;
class MemberAdmin extends \modules\admin\admin\Admin
{
    /**
     * 관리자 컨텍스트를 초기화한다.
     */
    public function init(): void
    {
        /**
         * 관리자 메뉴를 추가한다.
         */
        $this->addContext('/', '회원관리', 'xi xi-users');
        $this->addContext('/signup', '회원가입관리', 'xi xi-form-checkout');
    }
}
