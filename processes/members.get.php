<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원목록을 가져온다.
 *
 * @file /modules/member/processes/members.get.php
 * @author youlapark <youlapark@naddle.net>
 * @license MIT License
 * @modified 2025. 1. 9.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('members') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$columns = [
    'member_id',
    'email',
    'password',
    'code',
    'name',
    'nickname',
    'homepage',
    'telephone',
    'cellphone',
    'gender',
    'birthday',
    'zipcode',
    'address',
    'joined_at',
    'leaved_at',
    'logged_at',
    'logged_ip',
    'verified',
    'status',
    'extras',
];
$fields = Request::getSplit('fields') ?? [];
$sorters = Request::getJson('sorters');
$start = Request::getInt('start') ?? 0;
$limit = Request::getInt('limit') ?? 50;
$filters = Request::getJson('filters');
$keyword = Request::get('keyword');
$group_id = Request::get('group_id');
$level_id = Request::get('level_id');

$is_photo = in_array('photo', $fields);
if ($is_photo == true && in_array('member_id', $fields) == false) {
    $fields[] = 'member_id';
}

$columns = array_map(function ($column) {
    return 'm.' . $column;
}, Format::filter($fields, $columns));

$records = $me
    ->db()
    ->select($columns)
    ->from($me->table('members'), 'm');
if ($group_id !== null && $group_id !== 'all') {
    $records->join($me->table('group_members'), 'gm', 'gm.member_id=m.member_id')->where('gm.group_id', $group_id);
}
if ($level_id !== null) {
    $records->where('m.level_id', $level_id);
}

if ($filters !== null) {
    foreach ($filters as $field => $filter) {
        if ($filter->operator == '=') {
            $records->where('m.' . $field, $filter->value);
        }
    }
}

if ($keyword !== null) {
    $records->where('(name like ? or nickname like ? or email like ?)', array_fill(0, 3, '%' . $keyword . '%'));
}

$total = $records->copy()->count();
if ($sorters !== null) {
    foreach ($sorters as $field => $direction) {
        $records->orderBy($field, $direction);
    }
}
$records = $records->limit($start, $limit)->get();
foreach ($records as &$record) {
    $member = $me->getMember($record->member_id);
    if ($is_photo == true) {
        $record->photo = $me->getMemberPhoto($record->member_id);
    }
    $record->groups = [];
    foreach ($member->getGroups(true) as $group) {
        $title = $group->getGroup()->getTitle();
        $group_name = $member->getGroupPositionLabels($group_id);
        $record->groups[] = [
            'title' => $title,
            'manager' => $group_name['manager'] ?? null,
            'member' => $group_name['member'] ?? null,
        ];
    }
    sort($record->groups);
    $record->level = $member->getLevel()->getTitle();

    if ($group_id !== null && $group_id !== 'all') {
        $record->position = $member->getGroupPositionTitle($group_id, $record->member_id);
    }
}

$results->success = true;
$results->filters = $filters;
$results->records = $records;
$results->total = $total;
