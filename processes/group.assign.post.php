<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 그룹구성원을 저장한다.
 *
 * @file /modules/member/processes/group.assign.post.php
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

$group_id = Input::get('group_id');
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

$member_ids = Input::get('member_ids');
foreach ($member_ids as $member_id) {
    $me->assignGroup($group_id, $member_id);
}

$results->success = true;
$results->member_ids = $member_ids;
