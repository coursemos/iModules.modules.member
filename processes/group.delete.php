<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그룹정보를 삭제한다.
 *
 * @file /modules/member/processes/group.delete.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
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

$group_id = Request::get('group_id', true);
$group = $me
    ->db()
    ->select()
    ->from($me->table('groups'))
    ->where('group_id', $group_id)
    ->getOne();

if ($group === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND_DATA');
    return;
}

/**
 * @var \modules\member\admin\Member $mAdmin
 */
$mAdmin = $me->getAdmin();
$mAdmin->deleteGroup($group_id);

$results->success = true;
