<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈의 이벤트리스너를 정의한다.
 *
 * @file /modules/member/listeners/modules/admin/Listeners.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 10. 12.
 */
namespace modules\member\listeners\modules\admin;
class Listeners extends \modules\admin\Event
{
    /**
     * 권한식 프리셋을 가져올 때 발생한다.
     *
     * @param array $permissions 현재 설정된 권한식 프리셋 목록
     * @param \modules\admin\admin\Admin $mAdmin 관리자 객체
     */
    public static function getPermissionPresets(array &$permissions, \modules\admin\admin\Admin $mAdmin): void
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');

        /**
         * 회원권한식을 추가한다.
         */
        $permissions[] = $mAdmin->getPermissionExpression(
            $mMember->getText('permissions.all'),
            '${member.isMember} == true',
            5
        );

        /**
         * 회원그룹별 권한식을 추가한다.
         */
        $groups = $mMember
            ->db()
            ->select(['group_id', 'title'])
            ->from($mMember->table('groups'))
            ->get();
        foreach ($groups as $group) {
            $permissions[] = $mAdmin->getPermissionExpression(
                $mMember->getText('permissions.group', ['group' => $group->title]),
                'in_array("' . $group->group_id . '",${member.groups})',
                6
            );
        }
    }
}
