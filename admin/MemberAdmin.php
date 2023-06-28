<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈관리자 클래스를 정의한다.
 *
 * @file /modules/member/admin/MemberAdmin.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 28.
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
        $this->addContext('/members', $this->getText('admin.contexts.members'), 'xi xi-users', true);
        $this->addContext('/labels', $this->getText('admin.contexts.labels'), 'xi xi-tags');
    }

    /**
     * 각 컨텍스트의 콘텐츠를 가져온다.
     *
     * @param string $path 컨텍스트 경로
     * @param ?string $subPath 컨텍스트 하위경로
     */
    public function getContent(string $path, ?string $subPath = null): string
    {
        switch ($path) {
            case '/members':
                \Html::script($this->getBase() . '/scripts/members.js');
                break;

            case '/labels':
                \Html::script($this->getBase() . '/scripts/labels.js');
                break;
        }

        return '';
    }

    /**
     * 관리자 컨텍스트의 접근권한을 확인한다.
     *
     * @param string $path 컨텍스트경로
     * @param ?int $member_id 회원고유값 (NULL 인 경우 현재 로그인한 사용자)
     * @return bool $has_permission
     */
    public function hasContextPermission(string $path, ?int $member_id = null): bool
    {
        switch ($path) {
            case '/members':
                return true;

            default:
                return false;
        }
    }
}
