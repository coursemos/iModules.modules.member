<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원그룹을 가져온다.
 *
 * @file /modules/member/processes/groups.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 24.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * @var \modules\member\admin\MemberAdmin $mAdmin 관리자모듈
 */
$mAdmin = $me->getAdmin();

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($mAdmin->checkPermission('members', 'groups') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$mode = Request::get('mode') ?? 'tree';
$is_update = Request::get('is_update') === 'true';

$filters = Request::getJson('filters');
$parent = Request::getJson('parent');
$parent_id = $parent?->group_id ?? null;
$child = Request::getJson('child');
$child_id = $child?->group_id ?? null;

if ($is_update == true) {
    foreach (
        $mAdmin
            ->db()
            ->select()
            ->from($mAdmin->table('groups'))
            ->get()
        as $group
    ) {
        $mAdmin->updateGroup($group->group_id);
    }
}

if ($parent_id === null && $child_id === null) {
    $groups = [
        'group_id' => 'all',
        'title' => $me->getText('admin.groups.all'),
        'members' => $me
            ->db()
            ->select()
            ->from($me->table('members'))
            ->count(),
        'children' => false,
    ];

    if (($filters?->title?->value ?? null) === null) {
        $groups['children'] = $mAdmin->getGroups();
    } else {
        $groups['children'] = $mAdmin->getGroupsWithFilter($filters->title->value);
    }

    $results->success = true;
    $results->records = [$groups];
} elseif ($parent_id !== null) {
    $results->success = true;
    $results->records = $mAdmin->getGroupChildren($parent_id);
} elseif ($child_id !== null) {
    $results->success = true;
    $results->records = $mAdmin->getGroupParents($child_id);
}

$results->filters = $filters;
