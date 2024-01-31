<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 레벨정보를 삭제한다.
 *
 * @file /modules/member/processes/level.delete.php
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

$level_id = Request::get('level_id', true);
$level = $me
    ->db()
    ->select()
    ->from($me->table('levels'))
    ->where('level_id', $level_id)
    ->getOne();

if ($level === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND_DATA');
    return;
}

if ($level->level_id === 0) {
    $results->success = false;
    $results->message = $me->getErrorText('DEFAULT_LEVEL_EDIT_FAILED');
    return;
}

$me->db()
    ->delete($me->table('levels'))
    ->where('level_id', $level_id)
    ->execute();
$me->db()
    ->update($me->table('members'), ['level_id' => $level_id])
    ->where('level_id', $level_id)
    ->execute();

/**
 * @var \modules\member\admin\Member $mAdmin
 */
$mAdmin = $me->getAdmin();
$mAdmin->updateLevel(0);

$results->success = true;
