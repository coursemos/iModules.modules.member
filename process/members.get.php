<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원목록을 가져온다.
 *
 * @file /modules/member/process/members.get.php
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
 * @var \modules\admin\Admin $mAdmin 관리자모듈
 */
$mAdmin = Modules::get('admin');

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($mAdmin->isAdministrator() == false) {
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

$is_photo = in_array('photo', $fields);
if ($is_photo == true && in_array('member_id', $fields) == false) {
    $fields[] = 'member_id';
}

$records = $me
    ->db()
    ->select(Format::filter($fields, $columns))
    ->from($me->table('members'));

if ($filters !== null) {
    foreach ($filters as $field => $filter) {
        if ($filter->operator == '=') {
            $records->where($field, $filter->value);
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
    if ($is_photo == true) {
        $record->photo = $me->getMemberPhotoUrl($record->member_id);
    }
}

$results->success = true;
$results->filters = $filters;
$results->records = $records;
$results->total = $total;
