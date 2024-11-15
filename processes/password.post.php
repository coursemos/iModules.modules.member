<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 패스워드를 변경한다.
 *
 * @file /modules/member/processes/password.post.php
 * @author youlapark <youlapark@naddle.net>
 * @license MIT License
 * @modified 2024. 11. 15.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('members', ['edit']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

if ($me->isLogged() == false) {
    $results->success = false;
    $results->message = $me->getErrorText('REQUIRED_LOGIN');
}

$errors = [];
$password = Input::get('password', $errors);

if (count($errors) == 0) {
    $member_id = $me->getLogged();

    $insert['password'] = \Password::hash($password);

    $results = $me
        ->db()
        ->update($me->table('members'), $insert)
        ->where('member_id', $member_id)
        ->execute();

    if ($results == true) {
        $results->success = true;
    } else {
        $results->success = false;
        $results->message = 'CONNECT_ERROR';
    }
} else {
    $results->success = false;
    $results->errors = 'REQUIRED';
}
