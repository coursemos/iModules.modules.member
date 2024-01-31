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
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('members', ['groups']) == false) {
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

/**
 * @var \modules\member\admin\Member $mAdmin
 */
$mAdmin = $me->getAdmin();
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

    $groups['children'] = $mAdmin->getGroupTree(null, $filters?->title?->value ?? null);

    $results->success = true;
    $results->filter = $filters?->title?->value ?? null;
    $results->records = [$groups];
} elseif ($parent_id !== null) {
    $parent = $me->getGroup($parent_id);

    if ($parent === null) {
        $results->success = false;
        return;
    }
    $results->success = true;
    $results->records = $mAdmin->getGroupTree($parent_id, $filters?->title?->value ?? null, $parent->getDepth() + 1);
} elseif ($child_id !== null) {
    $results->success = true;
    $results->records = $me->getGroup($child_id)->getParentIds();
}

$results->filters = $filters;
