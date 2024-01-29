<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 레벨을 가져온다.
 *
 * @file /modules/member/processes/levels.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 29.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('members', ['levels']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$filters = Request::getJson('filters');

/**
 * @var \modules\member\admin\Member $mAdmin
 */
$mAdmin = $me->getAdmin();

$records = $me
    ->db()
    ->select(['level_id'])
    ->from($me->table('levels'))
    ->orderBy('level_id', 'asc')
    ->get('level_id');
foreach ($records as &$level_id) {
    $level_id = $me->getLevel($level_id)->getJson();
}

$results->success = true;
$results->records = $records;
