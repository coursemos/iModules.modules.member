<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 이벤트리스너를 실행한다.
 *
 * @file /modules/member/listeners/afterDoProcess.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 5. 11.
 *
 * @var \modules\member\Member $me
 * @var Module $target 이벤트를 발생시킨 모듈객체 (NULL 인 경우 아이모듈코어)
 * @var string $function 이벤트가 발생한 함수명
 * @var mixed $values 이벤트리스너에게 전달된 변수객체
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

if ($target?->getName() == 'admin') {
    /**
     * @var \modules\admin\Admin\Admin $mAdmin
     */
    $mAdmin = $target->getAdmin();

    if ($function == 'permissions.get') {
        if ($results->success == true) {
            $results->records[] = $mAdmin->getPermissionExpression(
                $me->getText('permissions.all'),
                '${member.isMember} == true',
                5
            );

            /**
             * 회원그룹을 가져온다.
             */
            $groups = $me
                ->db()
                ->select(['group_id', 'title'])
                ->from($me->table('groups'))
                ->get();
            foreach ($groups as $group) {
                $results->records[] = $mAdmin->getPermissionExpression(
                    $me->getText('permissions.group', ['group' => $group->title]),
                    '${member.groups} IN ' . $group->group_id,
                    6
                );
            }
        }
    }
}
